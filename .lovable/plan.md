

# Fix Business Model Canvas Not Updating

## Problem Identified

After analyzing the code and database, I found **two issues**:

### Issue 1: Content Stored as Raw String
The n8n workflow saves the AI's complete text response into the `content` field, including markdown formatting:

```
"Since the user instructions do not specify...\n\n```json\n{\n  \"businessModel\": {...}\n}\n```"
```

This is stored as a **string**, not as parsed JSON.

### Issue 2: BusinessModelPage Expects Parsed JSON
The page assumes `artifact.content` is already a parsed object:

```tsx
// Line 66 - This fails because content is a string, not an object
const content: BusinessModelContent | null = artifact?.content as BusinessModelContent;
```

---

## Solution

Add a content parsing layer in `BusinessModelPage.tsx` that extracts and parses JSON from the raw text content.

---

## Technical Changes

### File: `src/pages/BusinessModelPage.tsx`

**Add a helper function to extract JSON from markdown content:**

```tsx
// Helper to extract JSON from markdown code blocks or raw text
function parseArtifactContent(rawContent: unknown): BusinessModelContent | null {
  if (!rawContent) return null;
  
  // If already an object, return as-is
  if (typeof rawContent === 'object' && rawContent !== null) {
    return rawContent as BusinessModelContent;
  }
  
  // If string, try to extract JSON
  if (typeof rawContent === 'string') {
    try {
      // Try to find JSON in markdown code block
      const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        const parsed = JSON.parse(jsonMatch[1]);
        // Handle nested businessModel key
        return parsed.businessModel || parsed;
      }
      
      // Try direct JSON parse (in case it's raw JSON)
      const directParse = JSON.parse(rawContent);
      return directParse.businessModel || directParse;
    } catch {
      console.warn('Failed to parse artifact content:', rawContent.substring(0, 100));
      return null;
    }
  }
  
  return null;
}
```

**Update the content extraction (around line 66):**

| Before | After |
|--------|-------|
| `const content: BusinessModelContent \| null = artifact?.content as BusinessModelContent \|\| businessModel?.generatedModel;` | `const content: BusinessModelContent \| null = parseArtifactContent(artifact?.content) \|\| businessModel?.generatedModel;` |

---

## Why This Works

```text
+-------------------+     +------------------+     +-------------------+
| n8n Workflow      |     | Supabase         |     | BusinessModelPage |
| (AI Response)     | --> | artifacts table  | --> | parseContent()    |
|                   |     | (raw string)     |     | (extracts JSON)   |
+-------------------+     +------------------+     +-------------------+
        |                         |                         |
        v                         v                         v
   "Here is your           content: "...           { businessModel: {
    updated model:         ```json                    name: "...",
    ```json {...}```"      {...}```"                  revenue: {...}
                                                   }}
```

The parsing function handles:
1. Content that's already a parsed object (passthrough)
2. Content wrapped in markdown ` ```json ``` ` blocks
3. Nested `businessModel` key (common AI output format)
4. Direct JSON strings

---

## Files to Modify

| File | Change |
|------|--------|
| `src/pages/BusinessModelPage.tsx` | Add `parseArtifactContent()` helper and update content extraction |

---

## Expected Result

After this fix:
1. User asks Copilot to update the business model
2. n8n workflow updates the `artifacts` table
3. `refetchArtifact()` is called after 500ms delay
4. Page receives new data from Supabase
5. `parseArtifactContent()` extracts JSON from the markdown text
6. Business Model Canvas renders the updated data

