

## Plan: Remove Artifact Sharing Feature (Frontend Only)

Remove the collaborative sharing feature — it was scope drift. This deletes the share dialog, comments panel, public shared-artifact route, and supporting hooks. The backend tables (`shared_links`, `artifact_comments`) are left in place; no destructive DB changes.

### Files to delete

- `src/components/sharing/ShareDialog.tsx`
- `src/components/sharing/CommentsPanel.tsx`
- `src/hooks/useSharedLinks.ts`
- `src/hooks/useArtifactComments.ts`
- `src/pages/SharedArtifactPage.tsx`
- `src/components/sharing/` (empty directory after deletions)

### Files to edit

| File | Change |
|---|---|
| `src/App.tsx` | Remove `import SharedArtifactPage` (line 26) and the `<Route path="/shared/:token" …>` (line 114). |
| `src/components/dashboard/ArtifactBreadcrumb.tsx` | Remove `ShareDialog` import, the `useArtifact` lookup used only for `artifact?.id`, and the `<ShareDialog …>` render. Keep `ArtifactExportButton` and the breadcrumb intact. |

### Memory update

- Delete `mem://features/artifacts/collaborative-sharing` (feature no longer exists).
- Update `mem://index.md` to remove the "Collaborative Sharing" line from the Memories list.

### Out of scope

- Dropping `shared_links` / `artifact_comments` tables and related RLS policies. Left intact in case the feature returns; safe because nothing in the app references them after this change.
- Edge function changes — none of the sharing code touches edge functions.

