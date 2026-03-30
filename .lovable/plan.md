

# Link Landing Copy Card to Landing Page Generator

## Summary
Yes, the "Landing Copy" card in the Launching section is the same concept as the Landing Page Generator you already built. The plan is to make it a live, clickable card that navigates to `/landing-page` and shows a dynamic status badge instead of the static "Coming Soon" label.

## What Changes

### 1. Make "Landing Copy" a live artifact card (`ArtifactsGrid.tsx`)
- Remove "Landing Copy" from the hardcoded coming-soon array
- Make it a clickable card that navigates to `/landing-page`
- Query the `landing_pages` table (via `useLandingPage`) to determine status:
  - **No landing page exists** → badge: "Needs Setup" (muted style, card slightly dimmed)
  - **Landing page exists but not published** → badge: "Draft" (yellow/amber style)
  - **Landing page exists and published** → badge: "Live" (green style)
- Keep Social Content and Paywall Prompts as "Coming Soon"

### 2. Status badge styling
- "Needs Setup" — `bg-orange-500/20 text-orange-400` 
- "Draft" — `bg-yellow-500/20 text-yellow-400`
- "Live" — `bg-green-500/20 text-green-400`
- "Coming Soon" — unchanged (muted)

### File modified
- `src/components/dashboard/ArtifactsGrid.tsx` — import `useLandingPage`, replace Landing Copy from static card to interactive card with dynamic status

