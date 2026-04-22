

## Plan: Align kanban-board to spec (position recalc + top-insert) — keep current color palette

### Changes

**1. `src/hooks/useTasks.ts` — `moveTask`** 
Replace the single-row update with a batched recalculation so every affected row gets a clean sequential `position`:

- Build the destination column's new ordered list by inserting the dragged task at `newPosition`.
- If the source column differs, also rebuild the source column's list without the dragged task.
- Reassign `position = 0..n-1` for every row in the affected column(s) and the dragged task's new `status`.
- Persist via a single `upsert` writing `{ id, position, status, user_id, app_idea_id, title }` for all affected rows (PostgREST upsert requires non-null required columns, so the rebuild reads the full task objects from cache).
- Keep optimistic update + invalidation behavior intact.

**2. `src/hooks/useTasks.ts` — `addTaskMutation`** 
Insert new tasks at the top (`position = 0`) and shift the rest of that column down:

- Read existing tasks for the same `app_idea_id` + target `status` from the current cache.
- Insert the new task with `position = 0`.
- Issue a follow-up bulk update (`upsert` on `{ id, position }`) shifting each existing task in that column by `+1` (or simpler: rewrite all positions in that column starting at 1 in their previous order).
- Invalidate the tasks query.

**3. Color palette** 
Keep the current `red | orange | yellow | green | blue | purple | gray` palette as shipped. Update the kanban memory note to reflect the actual values so future agents don't drift back to the spec list.

**4. Memory update** 
Append a short memory file `mem://features/kanban/board-rules.md` capturing:
- Five-column order + status enum mapping
- Position rule: new tasks insert at top (`position = 0`); drag/drop recalculates all affected rows in column(s) sequentially
- Color palette: `red, orange, yellow, green, blue, purple, gray` (deviates from openspec; openspec list is outdated)

Add a one-line reference under `## Memories` in `mem://index.md` (preserving existing content).

### Files changed

| File | Change |
|---|---|
| `src/hooks/useTasks.ts` | Rewrite `moveTask` to batch-recalculate positions across affected column(s); change `addTaskMutation` to insert at `position = 0` and shift existing rows |
| `mem://features/kanban/board-rules.md` | New memory file documenting kanban rules and palette deviation |
| `mem://index.md` | Add reference line for the new memory |

### Out of scope

- No DB schema changes (existing `tasks.position integer` and `status text` already support this).
- No UI changes to `KanbanBoard`, `KanbanColumn`, or `TaskCard` — drag handlers already pass `(activeId, targetStatus, newPosition)` which matches the new `moveTask` signature.
- No changes to color picker UI or `Task['color']` union (decision B).
- No regeneration of historical task ordering — fix applies from next move/create onward; existing duplicate positions self-heal as soon as the column is touched.

