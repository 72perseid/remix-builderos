

## Bug Fix: Auto-select newly created app after onboarding completion

### Problem

When completing onboarding for a new app, the completion popup navigates to `/project-board` without updating the project selector. The `handleDismissPopup` and coaching button just call `navigate()` directly, skipping the `selectApp()` call. The `performFinalTransition` function does select the latest app, but none of the popup buttons use it.

Meanwhile, `useOnboardingChat` already tracks the new app's ID in its `appIdeaId` state and exposes it — but the OnboardingPage never uses it to update the ProjectContext.

### Fix — `src/pages/OnboardingPage.tsx`

1. **Read `appIdeaId` from the onboarding hook** — it's already returned but not destructured in OnboardingPage. Extract it alongside the other values.

2. **Before every navigation to `/project-board`, call `selectApp(appIdeaId)`** if available. Apply this to:
   - `handleDismissPopup` (the "Continue to Project Board" button / countdown)
   - `handleSkipToBoard`
   - The coaching button's onClick (navigate to `/coaching`)
   - The backup navigation timeout

This ensures the ProjectContext switches to the newly created app before the dashboard renders.

### Scope
- **1 file**: `src/pages/OnboardingPage.tsx`
- ~8 lines changed

