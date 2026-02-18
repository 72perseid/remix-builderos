
# Add App Deletion with Ellipsis Menu in App Selector Dropdown

## What changes

Each app row in the app selector dropdown will get a small horizontal ellipsis (MoreHorizontal) icon button on the right side. Clicking it opens a small secondary dropdown with a single "Delete App" text option. Selecting it triggers an `AlertDialog` confirmation before permanently deleting the app and all its related records.

## Cascading Delete — Records to Delete

When an app is deleted, the following related records must be removed (in dependency order to avoid FK constraint issues, and because RLS uses the user's own `user_id`):

1. `task_tags` — linked to tasks that belong to the app (via `tasks.app_idea_id`)
2. `tasks` — where `app_idea_id = appId`
3. `project_tags` — where `app_idea_id = appId`
4. `artifacts` — where `app_idea_id = appId`
5. `chat_messages` — linked to chat sessions that belong to the app (via `chat_sessions.app_idea_id`)
6. `chat_sessions` — where `app_idea_id = appId`
7. `business_models` — where `app_idea_id = appId`
8. `database_designs` — where `app_idea_id = appId`
9. `app_ideas` — the main record itself

Note: `artifacts` table currently has no DELETE RLS policy, so this deletion will need to be handled carefully — we'll delete only what we can from the client side. For `artifacts`, since users can't delete them via RLS, we'll skip that row silently and log a warning (or we can add an RLS policy). Actually, looking at the schema, a proper solution is to add a DELETE policy to `artifacts` as part of this change via a migration.

## Technical Changes

### 1. Database Migration — Add DELETE RLS policy to `artifacts`

```sql
CREATE POLICY "Users can delete own artifacts"
  ON artifacts FOR DELETE
  USING (auth.uid() = user_id);
```

### 2. `src/contexts/ProjectContext.tsx` — Add `deleteApp` function

Add a `deleteApp(appId: string): Promise<void>` method to the context that:
- Deletes `task_tags` for all tasks belonging to the app
- Deletes `tasks` where `app_idea_id = appId`
- Deletes `project_tags` where `app_idea_id = appId`
- Deletes `artifacts` where `app_idea_id = appId`
- Deletes `chat_messages` for sessions belonging to the app
- Deletes `chat_sessions` where `app_idea_id = appId`
- Deletes `business_models` where `app_idea_id = appId`
- Deletes `database_designs` where `app_idea_id = appId`
- Deletes the `app_ideas` record itself
- If deleted app was selected, clears the selection (falls back to next app)
- Calls `refreshApps()` to update the list
- Shows a success/error toast

### 3. `src/components/dashboard/DashboardHeader.tsx` — UI Changes

- Add state: `const [appToDelete, setAppToDelete] = useState<AppIdea | null>(null)`
- Import `MoreHorizontal` from lucide-react and `AlertDialog` components
- For each app row in the dropdown, add a small ellipsis button on the far right that:
  - Stops propagation so clicking it doesn't select the app
  - Opens a tiny sub-`DropdownMenu` with a single "Delete App" option styled in red/destructive
- Add an `AlertDialog` (rendered outside the dropdown) that:
  - Shows when `appToDelete !== null`
  - Warns: "This will permanently delete [App Name] and all its associated data including tasks, artifacts, business models, and database designs."
  - Has "Delete App" (destructive) and "Cancel" buttons
  - On confirm: calls `deleteApp(appToDelete.id)` then clears `appToDelete`

## Key Implementation Note

The ellipsis button uses a nested `DropdownMenu` inside the outer `DropdownMenu`. To prevent the outer dropdown from closing or selecting the app when the ellipsis is clicked, `e.stopPropagation()` must be called on the ellipsis button's click handler. The inner dropdown for the context menu will be positioned correctly since it's a separate Radix portal.
