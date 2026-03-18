

## Problem

The n8n response now includes `suggestions` as a proper JSON array field on `responseData`. But the code at line 242-257 only looks for suggestions embedded as text within the AI message string (regex parsing). It never checks `responseData.suggestions`.

## Fix

**`src/hooks/useOnboardingChat.ts`** — After the text-based regex extraction (line 256), add a check for `responseData.suggestions` as the primary source. If the JSON field exists and is an array, use it instead of (or as fallback to) the regex result.

Change lines 242-257 to:

```typescript
// Extract suggestions - prefer JSON field, fall back to text parsing
let responseSuggestions: string[] = [];

// 1. Check JSON field from n8n response
const suggestionsFromJson = responseData?.suggestions;
if (Array.isArray(suggestionsFromJson) && suggestionsFromJson.length > 0) {
  responseSuggestions = suggestionsFromJson.filter((s: unknown) => typeof s === 'string');
}

// 2. Fall back to parsing from message text
if (responseSuggestions.length === 0) {
  const suggestionsMatch = aiResponse.match(/suggestions:\s*(\[.*?\])/s);
  if (suggestionsMatch) {
    try {
      const parsed = JSON.parse(suggestionsMatch[1]);
      if (Array.isArray(parsed)) {
        responseSuggestions = parsed.filter((s: unknown) => typeof s === 'string');
      }
    } catch { /* ignore */ }
    aiResponse = aiResponse.replace(/\s*suggestions:\s*\[.*?\]/s, '').trim();
  }
}

console.log('Suggestions extracted:', responseSuggestions);
setSuggestions(responseSuggestions);
```

### Files Modified
- `src/hooks/useOnboardingChat.ts` — prioritize JSON `suggestions` field over text regex parsing

