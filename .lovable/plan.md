

## Bug Fix: Onboarding Completion Navigation Failures

### Root Cause

`performFinalTransition()` has a **5-second `await`** at the top plus additional async operations (query invalidation, data refresh) that can fail silently. When called from the countdown interval callback, errors are uncaught, so navigation to `/artifacts` never executes. The "Go to Dashboard" button also calls the same broken function.

### Problems identified

1. **Countdown ends but no navigation** — `performFinalTransition` is async and called inside `setInterval` without `.catch()`. Any rejection kills the chain before `navigate()`.
2. **"Go to Dashboard" button doesn't work** — same function, same 5-second blocking wait that can fail.
3. **No way to test the popup** — need a debug toggle button.

### Plan

**File: `src/pages/OnboardingPage.tsx`**

1. **Decouple countdown navigation from `performFinalTransition`** — When countdown hits 0, call `navigate('/artifacts', { replace: true })` directly instead of routing through the heavy async function. The data refresh is nice-to-have, not a navigation blocker.

2. **Fix "Go to Dashboard" button** — `handleSkipToBoard` should navigate immediately (`navigate('/artifacts', { replace: true })`) instead of calling `performFinalTransition`.

3. **Add a visible "Go to Dashboard" button in the session complete banner** that always shows (not gated on countdown), navigating directly.

4. **Add debug test button** — When debug mode is active (via `useDebugMode` hook), render a small button in the header area (e.g., "Test Completion Popup") that sets `isSessionComplete = true` to trigger the popup flow without needing the AI to actually complete the session.

5. **Keep `performFinalTransition` only for the legacy `JSON_GENERATION_COMPLETE` path and the completion overlay**, where the 5-second wait is intentional UX.

### Summary of changes
- ~15 lines changed in `OnboardingPage.tsx`
- No new files needed
- Direct `navigate()` calls replace async function for countdown/button paths
- Debug button conditionally rendered using existing `useDebugMode` hook

