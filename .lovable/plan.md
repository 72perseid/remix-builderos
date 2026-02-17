
# Add Skip/Cancel Confirmation Dialog on Onboarding Page

## What changes

A confirmation `AlertDialog` will be shown when the user clicks the **Skip** or **Cancel** button on the onboarding page, warning them of the consequences before proceeding.

## Dialog Content

- **Title**: "Skip Onboarding?"
- **Description**: A clear warning that skipping means they'll need to manually fill in all business modeling, target persona, product planning, and database design sections themselves — without AI-generated content.
- **Actions**:
  - **Continue Skipping** (destructive-style) — proceeds with the existing `handleSkip` logic
  - **Stay & Continue** — closes the dialog and resumes onboarding

The button label adapts to context: shows "Cancel" text in new-app mode and "Skip" in first-time onboarding mode.

## Technical Changes

### File: `src/pages/OnboardingPage.tsx`

1. Add imports for `AlertDialog`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction`, `AlertDialogCancel` from `@/components/ui/alert-dialog`.
2. Add a new state variable: `const [showSkipWarning, setShowSkipWarning] = useState(false)`.
3. Rename the existing `handleSkip` function to `confirmSkip` (the actual skip logic stays unchanged).
4. Change the Skip/Cancel button's `onClick` from `handleSkip` to `() => setShowSkipWarning(true)` — this intercepts the click and shows the dialog instead of immediately navigating.
5. Add the `AlertDialog` component near the bottom of the JSX (before the completion overlay), wired to `showSkipWarning` open state, with `confirmSkip` called on the confirm action.
