## Goal

Make the BuilderOS Architect banner CTA on `/artifacts` always lead somewhere meaningful, regardless of tier or completion state. Today, free users with a completed Business Model loop back to that same page, and premium users with everything done also fall back to BM — both are dead ends.

## Behavior matrix

| User state | CTA label | Destination |
|---|---|---|
| No artifact progress yet | Start Building | `/onboarding?mode=setup` (unchanged) |
| Free + BM incomplete (<100%) | Continue Building | `/business-model` |
| Free + BM complete (100%) | Unlock the Builder Suite | `/coaching` |
| Premium + any planning artifact incomplete | Continue Building | First incomplete in BM → UV → PB → UI/UX |
| Premium + all planning artifacts complete | Go to Project Board | `/project-board` |

The banner copy already swaps based on `hasData`, so no string change there beyond the CTA label/icon.

## Files to change

- `src/components/dashboard/ArtifactsGrid.tsx`
  - Replace the current `continueRoute` IIFE with a small helper that returns `{ route, label, icon }` based on `canBuild` + `completionMap`.
  - Pass the resolved `label` and `icon` into `ArchitectBanner` (props already exist: `ctaLabel`, `ctaIcon`).
  - For the free-tier-complete case, use `ctaIcon="chat"` swapped to a lock/sparkle feel — actually reuse existing `'rocket'` icon for "Go to Project Board" and add a third icon option for upsell.

- `src/components/dashboard/ArchitectBanner.tsx`
  - Extend `ctaIcon` union to `'rocket' | 'chat' | 'lock'` and import `Lock` from `lucide-react`. Map `'lock'` → `Lock` icon (used for the upsell CTA).

No changes to data fetching, access gating, or routing config.

## Why this fixes it

Every state now has a forward action: build more, unlock more, or move to the next phase. No more clicking "Continue Building" and landing on the page you just finished.
