
# Fix Data Loss: Persist Tasks and Acceptance Criteria to Database

## Problem Analysis

After examining the codebase, I found the root cause of the data loss:

**Current State:**
- `ProjectBoardPage.tsx` manages cards entirely in local React state (`useState`)
- Cards are initially loaded from an artifact (read-only JSON blob)
- When users add "Tasks" or "Acceptance Criteria", they're stored in local state only
- On page refresh, all data is lost because nothing is saved to Supabase

**The Missing Link:**
The `useTasks` hook exists and has database persistence logic, but `ProjectBoardPage.tsx` does NOT use it. Instead, it has its own isolated local state.

---

## Required Changes

### 1. Update `useTasks.ts` - Add `subtasks` to update mutation

**Current Issue:** The `updateTaskMutation` handles `checklist` but is missing `subtasks`.

**Changes:**
- Add `subtasks` mapping in the `updateTaskMutation` function
- Add `.select()` after update for confirmation

```typescript
// Line ~146 in useTasks.ts - Add this line:
if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;
if (updates.checklist !== undefined) dbUpdates.checklist = updates.checklist;
```

---

### 2. Update `TaskDialog.tsx` - Include subtasks/checklist in save

**Current Issue:** The `handleSave` function doesn't include `subtasks` or `checklist` fields.

**Changes:**
- Add local state for `subtasks` and `checklist`
- Load these from task prop in useEffect
- Include them in the `onSave` callback

```typescript
// Add state variables
const [subtasks, setSubtasks] = useState<AcceptanceCriteriaItem[]>([]);
const [checklist, setChecklist] = useState<AcceptanceCriteriaItem[]>([]);

// In useEffect - load from task
setSubtasks(task.subtasks || []);
setChecklist(task.checklist || []);

// In handleSave - include in payload
onSave({
  ...otherFields,
  subtasks,
  checklist,
});
```

---

### 3. Refactor `ProjectBoardPage.tsx` - Integrate with useTasks hook

**This is the critical fix.** The page needs to:

1. **Import and use `useTasks` hook** instead of local state
2. **Map between KanbanCard and Task types**
3. **Call `updateTask` mutation** when saving changes

**Key Changes:**

```typescript
// Import the hook
import { useTasks } from '@/hooks/useTasks';

// Use it in component
const { tasks, updateTask, addTask, deleteTask } = useTasks();

// Transform tasks to columns format for display
const columns = useMemo(() => {
  const cols: Record<string, KanbanCard[]> = {};
  COLUMN_CONFIG.forEach(c => cols[c.id] = []);
  
  tasks.forEach(task => {
    const card: KanbanCard = {
      id: task.id,
      title: task.title,
      description: task.description || '',
      tag: task.category || 'MVP',
      priority: task.priority,
      plannedDate: task.plannedDate,
      checklist: task.checklist || [],
      tasks: task.subtasks || [],  // Map subtasks to tasks
    };
    cols[task.status]?.push(card);
  });
  
  return cols;
}, [tasks]);

// Update handleSaveEdit to call the mutation
const handleSaveEdit = useCallback(() => {
  if (!editingCard) return;
  
  updateTask(editingCard.id, {
    title: editingCard.title,
    description: editingCard.description,
    plannedDate: editingCard.plannedDate,
    subtasks: editingCard.tasks,      // UI "Tasks" -> DB subtasks
    checklist: editingCard.checklist, // UI "Acceptance Criteria" -> DB checklist
  });
  
  setIsEditDialogOpen(false);
}, [editingCard, updateTask]);
```

---

## Data Flow After Fix

```text
+----------------+      +-------------+      +-----------+
|   UI Layer     |      | useTasks    |      | Supabase  |
|                |      | Hook        |      | Database  |
+----------------+      +-------------+      +-----------+
        |                     |                    |
        | User adds task      |                    |
        |-------------------->|                    |
        |                     | UPDATE tasks SET   |
        |                     | subtasks = [...]   |
        |                     |------------------->|
        |                     |                    |
        |                     |<-------------------| 
        |                     | Invalidate query   |
        |<--------------------|                    |
        | Re-render with      |                    |
        | persisted data      |                    |
```

---

## Field Mapping Reference

| UI Section | Card Field | Task Type Field | DB Column |
|------------|------------|-----------------|-----------|
| Tasks | `tasks` | `subtasks` | `subtasks` (JSONB) |
| Acceptance Criteria | `checklist` | `checklist` | `checklist` (JSONB) |

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/hooks/useTasks.ts` | Add `subtasks` to update mutation, add `.select()` |
| `src/components/kanban/TaskDialog.tsx` | Add subtasks/checklist state and include in save |
| `src/pages/ProjectBoardPage.tsx` | Integrate with `useTasks` hook, persist changes to DB |

---

## Expected Outcome

After these changes:
1. Opening the Project Board loads tasks from Supabase (not just artifact)
2. Adding a "Task" item updates the `subtasks` JSONB column
3. Adding an "Acceptance Criteria" item updates the `checklist` JSONB column
4. Refreshing the page shows all previously saved data
5. Data persists across sessions

