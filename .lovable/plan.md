

# Refine Edit Card Modal - Focus on Deadline, Task, and Acceptance Criteria

## Overview
This plan refines the Edit Card Modal to be minimal and focused on three core concepts:
1. **Task** - Title and Description
2. **Deadline** - When is it due? (maps to `planned_date`)
3. **Acceptance Criteria** - How do we know it's done? (maps to `checklist` jsonb)

---

## Changes Summary

### 1. Remove Unnecessary Features

**From the Right Sidebar, remove:**
- Members button (not needed for solo/small team use)
- Labels button (tags like MVP/V1 can remain visible in the left column but not editable via sidebar)
- Cover button (keep UI clean)
- Copy button (simplified actions)

**Icons to remove from imports:**
- `Users` (Members)
- `Image` (Cover)  
- `Tag` (Labels)
- `Copy`

---

### 2. Rename "Checklist" to "Acceptance Criteria"

**Right Sidebar:**
- Change button label from "Checklist" to "Acceptance Criteria"
- Keep the `CheckSquare` icon

**Add Acceptance Criteria Section in Left Column:**
When clicked, expand a section in the left column showing:
- Header: "Acceptance Criteria" with CheckSquare icon
- Input field: "Add an item..."
- List of items with checkboxes
- Progress indicator: "2/5 passed"

**Data Structure (stored in `checklist` jsonb column):**
```json
[
  { "id": "ac-1", "text": "User can log in", "done": false },
  { "id": "ac-2", "text": "Error message shown on failure", "done": true }
]
```

---

### 3. Deadline Functionality

**Right Sidebar:**
- Rename "Dates" button to "Deadline"
- Keep the `Calendar` icon

**When clicked:**
- Open a date picker popover (using Shadcn Calendar)
- Selected date saves to `planned_date` column

**Card Face Badge:**
- Show deadline badge on TaskCard
- **Red background** if overdue (past date, task not done)
- **Yellow background** if due within 3 days
- **Gray background** for future dates

---

### 4. Updated Right Sidebar Layout

```text
Add to card
  [CheckSquare] Acceptance Criteria
  [Calendar]    Deadline

Actions
  [ArrowRight]  Move
  [Trash2]      Delete
```

---

## Technical Implementation

### Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ProjectBoardPage.tsx` | Major update to Edit Dialog, TaskCard, and state management |
| `src/hooks/useTasks.ts` | Add `checklist` field to Task mapping and mutations |
| `src/types/index.ts` | Add `AcceptanceCriteriaItem` interface and `checklist` to Task type |

---

### Detailed Code Changes

#### A. Update Types (`src/types/index.ts`)

Add new interface for acceptance criteria items:
```typescript
export interface AcceptanceCriteriaItem {
  id: string;
  text: string;
  done: boolean;
}
```

Add `checklist` and ensure `plannedDate` is in the Task interface (already present).

#### B. Update useTasks Hook (`src/hooks/useTasks.ts`)

- Map `checklist` from database to Task object
- Include `checklist` in add/update mutations
- Parse JSON safely with fallback to empty array

#### C. Update ProjectBoardPage.tsx

**1. Update KanbanCard Interface:**
```typescript
interface KanbanCard {
  id: string;
  tag: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
  coverColor?: string;
  plannedDate?: string;           // Add deadline
  checklist?: AcceptanceCriteriaItem[];  // Add acceptance criteria
}
```

**2. TaskCard Component - Add Badges:**
- Add deadline badge with color logic (red/yellow/gray)
- Add acceptance criteria progress indicator (e.g., "2/5")
- Use `date-fns` for date comparison (isPast, differenceInDays)

**3. Edit Dialog - Left Column:**
- Remove Labels preview section (or keep read-only)
- Add Acceptance Criteria section:
  - Show when user clicks "Acceptance Criteria" button
  - Input to add new items
  - List with checkboxes
  - Progress bar/text

**4. Edit Dialog - Right Sidebar:**
- Remove: Members, Labels, Cover, Copy buttons
- Rename: "Checklist" -> "Acceptance Criteria"
- Rename: "Dates" -> "Deadline"
- Add onClick handlers to toggle sections/popovers

**5. Add Deadline Picker:**
- Use Popover + Calendar components
- On date select, update `editingCard.plannedDate`
- Show current date if set, with option to remove

**6. State Management:**
- Add state for showing acceptance criteria section
- Add state for deadline popover open/close
- Track new criteria item input

---

### Card Face Visual Updates

**TaskCard will show:**
```text
+---------------------------+
| [MVP] [V1]  (label pills) |
| Task Title                |
| Description preview...    |
|                           |
| [Calendar] Jan 28  [2/5]  |  <- Badges row
+---------------------------+
```

- Deadline badge: Calendar icon + date, colored by urgency
- Acceptance Criteria badge: Checkmark icon + "X/Y" count

---

### Acceptance Criteria UI Flow

1. User clicks "Acceptance Criteria" in sidebar
2. Section expands in left column below Description
3. User types "User can log in successfully" and presses Enter
4. Item appears with unchecked checkbox
5. User clicks checkbox -> updates `done: true`
6. Progress shows "1/1 passed"
7. On Save, entire checklist array saves to database

---

## Summary of Visual Changes

### Before (Current Modal)
```text
+----------------------------------------+
| [Title]                           [X]  |
| in list "Selected"                     |
+----------------------------------------+
| [MVP] [high]                           |
|                                        |
| Description                            |
| [textarea]                             |
|                                        |
| Activity                               |
| [avatar] [comment input]               |
+----------------------------------------+
```

### After (Simplified Modal)
```text
+---------------------------------------------+
| [Title]                                [X]  |
| in list "Selected"                          |
+---------------------------+-----------------+
| Description               | Add to card     |
| [textarea]                | [✓] Acceptance  |
|                           | [📅] Deadline   |
| Acceptance Criteria (2/3) |                 |
| [x] Item one              | Actions         |
| [ ] Item two              | [→] Move        |
| [x] Item three            | [🗑] Delete      |
| [+ Add item...]           |                 |
|                           |                 |
| Activity                  |                 |
| [avatar] [Write comment]  |                 |
+---------------------------+-----------------+
|                       [Save Changes]        |
+---------------------------------------------+
```

---

## Dependencies

- `date-fns` (already installed) - for date comparison logic
- Shadcn Calendar component (already available at `@/components/ui/calendar`)
- Shadcn Popover component (already available at `@/components/ui/popover`)

