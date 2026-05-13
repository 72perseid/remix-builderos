## Goal

Stop the BuilderOS Architect banner from sending users back into the onboarding chat once they already have artifact progress. Keep it visible as a useful entry point, but route it to the existing Copilot sidebar instead.

## Behavior

In `src/components/dashboard/ArtifactsGrid.tsx`, the banner currently renders only when `!isOnboarded` and always navigates to `/onboarding?mode=setup`. Change to:

- **Always render** the banner on the Artifacts page (drop the `!isOnboarded` gate).
- **Two CTA modes**, decided by `hasAnyData` (already computed as `artifacts.length > 0`) OR any non-zero completion in `completionMap`:
  - **No progress yet** → CTA label "Start Building", action navigates to `/onboarding?mode=setup` (current behavior).
  - **Has progress** → CTA label "Open Copilot", action calls `useChatContext().openChat()` — opens the right-side Copilot sidebar, no onboarding re-entry.
- Banner copy stays driven by the existing `hasData` prop in `ArchitectBanner` (already shows the "artifacts are ready… refine or regenerate" variant when true).

## Files

- `src/components/dashboard/ArtifactsGrid.tsx` — replace the `onStartBuilding` handler with a conditional that calls `openChat()` when there's progress, else `navigate('/onboarding?mode=setup')`. Remove the `!isOnboarded` wrapper so onboarded users still see the banner (now safely pointing at Copilot).
- `src/components/dashboard/ArchitectBanner.tsx` — accept an optional `ctaLabel` prop (defaults to current "Start Building" / "Continue Building" logic) so the "has progress" state can render "Open Copilot" with a more appropriate icon (keep `Rocket` or switch to `MessageSquare` — minor).

No changes to data fetching, routing config, onboarding flow, or business logic.

## Why this fixes the bug

The reported confusion is: completed onboarding → clicked banner → dropped back into onboarding chat. After this change, the only way back into `/onboarding` from the banner is when the app genuinely has zero artifact progress, which is the only state where re-entering onboarding is safe.
