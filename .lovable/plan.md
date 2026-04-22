

## Plan: Blur kanban + paywall overlay for free users on `/project-board`

When a free user (no `buildAccess` and not admin) lands on `/project-board`, render the kanban columns blurred with a centered paywall card on top — matching the existing "browse but locked" pattern.

### Behavior

- **Admins / users with `buildAccess`**: no change. Full kanban remains interactive.
- **Free users**: 
  - Kanban board area renders as-is (with their data or empty placeholders) but is wrapped in a blurred, non-interactive overlay container.
  - A paywall card sits centered on top with the same visual language as `PaywallDialog` (lock icon + title + bullets + CTA → `/coaching`).
  - All clicks/drags inside the kanban are disabled (`pointer-events-none`).
  - The Architect banner (above the kanban) stays visible and unblurred so onboarding messaging still reads.

### Implementation (`src/pages/ProjectBoardPage.tsx`)

1. Import `useEnrollment`, `useIsAdmin`, and `Lock`/`Sparkles` icons + `Button` (already imported).
2. Compute `const isLocked = !isAdmin && !buildAccess;` after the existing loading checks.
3. Wrap the existing `<Kanban>...</Kanban>` block in a `relative` container.
4. When `isLocked`:
   - Apply `blur-md select-none pointer-events-none` to the kanban wrapper.
   - Render an absolute-positioned overlay (`absolute inset-0 flex items-center justify-center z-10`) containing an inline paywall card:
     - Lock icon header (matching `PaywallDialog` styling — primary-tinted rounded square, `Sparkles` + small `Lock` badge).
     - Title: **"Unlock the Builder Suite"**
     - Description: "Get full access to the AI-powered planning and building tools to ship your app faster."
     - 3 bullet items (same as `PAYWALL_COPY.build`):
       - Project board & task automation
       - Business model, validation & product brief artifacts
       - Database design & master prompt generator
     - Primary CTA button: **"Talk to an Expert"** → `navigate('/coaching')`.
   - Card styled as `bg-card/95 backdrop-blur border border-slate-700/50 rounded-2xl p-6 max-w-md shadow-2xl`.

### Files changed

| File | Change |
|---|---|
| `src/pages/ProjectBoardPage.tsx` | Add `isLocked` check; wrap kanban with blur + non-interactive; render inline paywall overlay card on top |

### Out of scope

- Changes to `PaywallDialog` component itself (we render an inline card instead of a modal so it stays persistent on the page).
- Changes to artifact card click paywalls or other modules.
- Changes to `ProtectedRoute`, sidebar, or `useEnrollment`.

