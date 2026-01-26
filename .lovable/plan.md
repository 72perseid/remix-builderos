

# Update Artifact Import Logic for Subtasks and Acceptance Criteria

## Overview
Update the import flow to properly map AI-generated `subtasks` and `acceptance_criteria` from the JSON artifact into the Supabase `tasks` table columns (`subtasks` and `checklist`).

## Current State
- The `tasks` table has both `subtasks` (jsonb) and `checklist` (jsonb) columns
- The current import logic in `AIKanbanAssistantPage.tsx` only maps basic fields (title, description, status, etc.)
- The `importTasks` function in `useTasks.ts` does not include `subtasks` or `checklist` in the insert operation
- The `Task` type in `src/types/index.ts` only defines `checklist` but not `subtasks`

## Implementation Steps

### Step 1: Update Types (src/types/index.ts)
Add a `subtasks` field to the `Task` interface to mirror `checklist`:

```text
Task interface additions:
- subtasks?: AcceptanceCriteriaItem[]  (same structure as checklist)
```

### Step 2: Update RoadmapContent Interface (src/pages/AIKanbanAssistantPage.tsx)
Expand the card interface to include the new AI JSON fields:

```text
cards: {
  tag: string;
  title: string;
  description: string;
  subtasks?: string[];           // NEW: AI-generated subtasks
  acceptance_criteria?: string[]; // NEW: AI-generated acceptance criteria
}[]
```

### Step 3: Create Conversion Helper Function (src/pages/AIKanbanAssistantPage.tsx)
Add a utility function to convert string arrays to the required JSONB format:

```text
function convertToChecklistItems(items: string[] | undefined): AcceptanceCriteriaItem[] {
  if (!items || items.length === 0) return [];
  return items.map(text => ({
    id: crypto.randomUUID(),  // Generate unique ID
    text: text,
    done: false
  }));
}
```

### Step 4: Update Import Mapping (src/pages/AIKanbanAssistantPage.tsx)
Modify `handleImportToKanban` to include the new fields:

```text
const tasksToImport = allCards.map((card) => ({
  title: card.title,
  description: card.description || '',
  status: 'backlog',
  color: 'lavender',
  category: card.tag,
  priority: 'medium',
  estimatedEffort: '',
  subtasks: convertToChecklistItems(card.subtasks),        // NEW
  checklist: convertToChecklistItems(card.acceptance_criteria), // NEW
}));
```

### Step 5: Update importTasks Function (src/hooks/useTasks.ts)
Add `subtasks` and `checklist` to the database insert operation:

```text
const tasksToInsert = newTasks.map((task, index) => ({
  // ... existing fields ...
  subtasks: task.subtasks || [],      // NEW
  checklist: task.checklist || [],     // NEW
}));
```

### Step 6: Update Query Parsing (src/hooks/useTasks.ts)
Add parsing for `subtasks` when fetching tasks from the database:

```text
// In the query mapping:
subtasks: parseChecklist(task.subtasks),  // Reuse existing parseChecklist function
checklist: parseChecklist(task.checklist),
```

## Data Flow Diagram

```text
+------------------+     +------------------------+     +------------------+
| AI JSON Artifact |     | AIKanbanAssistantPage  |     | Supabase tasks   |
+------------------+     +------------------------+     +------------------+
|                  |     |                        |     |                  |
| card.subtasks    | --> | convertToChecklistItems| --> | subtasks (jsonb) |
| ["Do X", "Do Y"] |     | [{id, text, done}]     |     |                  |
|                  |     |                        |     |                  |
| card.acceptance_ | --> | convertToChecklistItems| --> | checklist (jsonb)|
| criteria         |     | [{id, text, done}]     |     |                  |
+------------------+     +------------------------+     +------------------+
```

## Files to Modify

| File | Changes |
|------|---------|
| `src/types/index.ts` | Add `subtasks` field to `Task` interface |
| `src/pages/AIKanbanAssistantPage.tsx` | Update interface, add converter, update mapping |
| `src/hooks/useTasks.ts` | Add fields to import insert + parse subtasks on fetch |

---

## Technical Details

### UUID Generation
Using `crypto.randomUUID()` which is available in all modern browsers and provides cryptographically secure unique IDs.

### Empty Array Handling
If `subtasks` or `acceptance_criteria` is missing or empty in the AI JSON, an empty array `[]` will be saved to the database.

### Backward Compatibility
Existing tasks without subtasks/checklist data will continue to work as the parsing functions already handle null/undefined values gracefully.

