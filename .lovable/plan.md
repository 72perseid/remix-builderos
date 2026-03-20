

## Fix: Stale completion percentages on Artifacts dashboard

### Root Cause

The Artifacts grid reads completion from `selectedApp?.bm_completion` (line 78-82 of `ArtifactsGrid.tsx`), which comes from the `ProjectContext`'s `apps` array. This array is fetched **once on mount** and never refreshed when completion values change in the database.

The individual artifact pages (e.g. Business Model) show the correct 100% because they have their own `useQuery` that fetches directly from `app_ideas`.

The DB currently has all completions at 100%, but the dashboard still shows 80/90/68 — the values from when `ProjectContext` last loaded.

### Fix

**File: `src/contexts/ProjectContext.tsx`**

The `selectedApp` is derived from `apps.find(...)` (line 138). When navigating back to the dashboard, the stale cached array is used. Two options:

**Option A (Simple — recommended):** Call `refreshApps()` when the Artifacts grid mounts, so it always gets fresh data from the DB.

- In `ArtifactsGrid.tsx`, add a `useEffect` that calls `refreshApps()` on mount
- This ensures completion values are current whenever the user visits the dashboard

**Option B (Reactive):** Subscribe to Supabase realtime changes on `app_ideas` table to auto-update. More complex, higher cost.

### Changes

| File | Change |
|------|--------|
| `src/components/dashboard/ArtifactsGrid.tsx` | Add `refreshApps` from `useProjectContext()`, call it in a `useEffect` on mount to refresh stale completion data |

One line added to imports, ~4 lines for the effect. No other files need changes.

