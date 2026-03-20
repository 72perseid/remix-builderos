

## Plan: Fix "Create New App" Flow Retaining First Project Data

### Root Cause Analysis

There are **three interconnected bugs** causing the new app flow to behave as if continuing the first project:

**Bug 1: `resolveWorkflowMode` always returns the first project's ID**
In `sendMessage()` (line 283-311 of `useOnboardingChat.ts`), after every AI response, it calls `resolveWorkflowMode()` which queries `app_ideas` ordered by `created_at DESC` and returns the **most recent existing app**. As soon as it finds one, it sets `forcedNewAppRef.current = false` and switches to `'onboarded'` mode with the old app's ID. This means from the **second message onward**, the backend receives the old project's `app_idea_id`, so the AI continues that project.

**Bug 2: Progress bar shows old project's completion**
When the post-response code fetches completion for `latestState.appIdeaId` (line 291), it's fetching the **first project's** bm/uv/pb completion — so the UI shows stale progress.

**Bug 3: `sendMessage` doesn't pass `app_idea_id: null` in new mode**
When `forcedNewAppRef.current` is true, `resolvedAppIdeaId` stays `null`, which is correct. But after the first response creates a new app_idea on the backend, the post-response block immediately picks up the old app (not the new one) because `resolveWorkflowMode` just gets the latest by `created_at` — and there may be a race condition where the new app isn't written yet.

### Fix

**File: `src/hooks/useOnboardingChat.ts`**

1. **Keep `forcedNewAppRef` true until the hook detects a *newly created* app idea** — not just any existing one. Track the set of app_idea IDs that existed *before* the new-app session started. After each response, only switch out of `new` mode if a new ID appears that wasn't in the pre-existing set.

2. **In `sendMessage`, when `forcedNewAppRef.current` is true:**
   - Skip the post-response `resolveWorkflowMode` call entirely, OR
   - Only transition out of `new` mode if a **new** app_idea_id is found (one that didn't exist at session start)

3. **Store pre-existing app IDs on init** when `forceNew` is true, so we can distinguish old vs. newly-created apps.

**Concrete changes:**

- Add a `preExistingAppIdsRef = useRef<Set<string>>(new Set())` 
- In the `forceNew` init block, fetch all existing app_idea IDs and store them in the ref
- In the post-response block (lines 283-311), when `forcedNewAppRef.current` was true at send time, only switch to onboarded if `latestState.appIdeaId` is NOT in the pre-existing set (meaning it's the newly created app)
- When transitioning, set `appIdeaId` to the **new** app's ID, not the old one
- Reset completion values to 0 when entering forceNew mode (lines 61-62)

**File: `src/lib/resolveWorkflowMode.ts`**

No changes needed — the function itself is fine; the problem is how its result is used.

### Summary of Changes

| File | Change |
|------|--------|
| `src/hooks/useOnboardingChat.ts` | Track pre-existing app IDs; only exit `new` mode when a genuinely new app is detected; reset completion to 0 on forceNew init |

### Single file, ~20 lines changed.

