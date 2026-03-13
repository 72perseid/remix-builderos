

## Plan: Remove `ux_completion` from Completion Requirements

### Problem
The `ux_completion` field is included in the database trigger that fires the `generate-artifacts` webhook, but the UI/UX artifact is marked "Coming Soon" and never reaches 100%. This blocks the trigger from ever firing.

### Changes

**1. Database migration — Update `check_completion_and_trigger()` function**

Remove `ux_completion` from both `was_full` and `is_full` checks so the trigger fires when only `bm_completion`, `pb_completion`, and `uv_completion` reach 100%.

**2. `src/components/dashboard/ArtifactsGrid.tsx` — Update master_prompt prerequisites**

Remove `'ui_ux'` from the `prerequisites` array (line 99) so the master prompt card shows "ready" without needing a UI/UX artifact.

**3. `src/components/dashboard/ArtifactsGrid.tsx` — Update completionMap**

Remove the `ui_ux` entry from `completionMap` (line 79) since it's not relevant while the feature is Coming Soon.

