

## Plan: Replace access-hiding with paywall modals

Stop hiding gated features for free users. Always show **Build**, **Calendar**, **Programs** (flagship), and **Artifact cards**. When a user without access clicks any of them, open a paywall modal that explains what they unlock and routes them to `/coaching`.

### New shared component

**`src/components/paywall/PaywallDialog.tsx`** — reusable modal built on `Dialog`.

Props:
- `open`, `onOpenChange`
- `feature: 'build' | 'calendar' | 'programs'` — drives icon, title, copy
- `onUpgrade?: () => void` — defaults to `navigate('/coaching')`

Content per feature (centralized in a `PAYWALL_COPY` map):
- **Build** — "Unlock the Builder Suite" — Project board, artifacts, DB design, master prompt
- **Calendar** — "Unlock the Expert Calendar" — See and book live sessions with experts
- **Programs** — "Unlock the Flagship Programs" — DIA Vibe Coding MBA & premium courses

Visual: Lock icon header, feature bullet list, primary CTA "Talk to an Expert" → `/coaching`, secondary "Maybe later" closes.

### New hook

**`src/hooks/usePaywall.ts`** — lightweight context-free hook returning `{ open, close, feature }` + a `<Paywall />` element to mount. Implementation: local `useState` for `feature: PaywallFeature | null`. Each consumer mounts its own `PaywallDialog`.

### Sidebar (`DashboardSidebar.tsx`)

- Stop filtering `mainNavItems` by `accessMap`. **Always show Build, Programs, Calendar.**
- Replace `<Link>` with conditional behavior: if item has `accessKey` and user lacks access (and not admin), render as `<button>` that opens paywall instead of navigating.
- Keep Admin item gated by `isAdmin`.
- Mount one `PaywallDialog` inside the sidebar component, controlled by local state.

### Artifacts grid (`ArtifactsGrid.tsx`)

- Always render the page (never blocked) — but Build access is what gates artifact navigation.
- Use `useEnrollment()` + `useIsAdmin()`. If `!buildAccess && !isAdmin`:
  - All artifact cards remain visible with their normal status badges.
  - Clicking ANY artifact card → opens paywall (`feature='build'`) instead of navigating to its route.
  - Same applies to "Landing Copy" and the Architect banner CTA.
- Mount `PaywallDialog` once at the grid level.

### Programs page (`ProgramsPage.tsx`)

- Always render flagship section (no gating).
- If `!programsAccess && !isAdmin`, replace `CourseCardLarge.onClick` with paywall trigger (`feature='programs'`).
- Optionally add a small lock badge overlay on flagship thumbnails for clarity.
- Complementary courses remain freely clickable.

### ProtectedRoute (`ProtectedRoute.tsx`)

Keep route-level gating as a safety net (deep-links still redirect), but since clicks no longer navigate to gated routes, the redirect is rarely hit. **No changes required** — current behavior is correct as a fallback.

Optionally relax the redirect for `/project-board`, `/calendar`, `/programs` to take users to `/coaching` directly (instead of `getFirstAccessibleRoute`) so deep-link visitors land on the upsell page. Will keep current logic unless requested.

### Files changed

| File | Change |
|---|---|
| `src/components/paywall/PaywallDialog.tsx` | New — shared paywall modal with per-feature copy |
| `src/hooks/usePaywall.ts` | New — minimal local-state hook for trigger/close |
| `src/components/dashboard/DashboardSidebar.tsx` | Always show Build/Calendar/Programs; gated items open paywall on click |
| `src/components/dashboard/ArtifactsGrid.tsx` | Without `buildAccess`, all card clicks open paywall instead of navigating |
| `src/pages/ProgramsPage.tsx` | Flagship cards always shown; clicks without `programsAccess` open paywall |

### Out of scope

- Changing `/coaching` page itself
- Server-side or RLS changes (artifacts/tasks RLS already self-scoped)
- Paywall analytics/tracking events (can add later)
- Per-card lock overlays on individual artifacts (cards keep current visual; only click behavior changes)

