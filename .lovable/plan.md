

## Plan: Refine paywall trigger points

Loosen the paywalls so free users can browse all pages, but only hit the upsell when they try to engage with gated content.

### Build module

- **Sidebar (`DashboardSidebar.tsx`)**: Remove the "Build" lock. Build nav item always navigates to `/project-board` for everyone (no paywall on click).
- **Project board page**: No changes — it's already viewable.
- **Artifacts grid (`ArtifactsGrid.tsx`)**:
  - Page itself stays fully accessible (already does).
  - Clicking any artifact card (Business Model, Validation, Product Brief, UI/UX, DB Design, Master Prompt, Landing Copy) → opens paywall (`feature='build'`) if `!buildAccess && !isAdmin`.
  - Architect banner CTA → also opens the paywall.
  - This is already implemented; verify it stays in place after sidebar change.

### Programs module

- **Sidebar**: Remove the "Programs" lock. Programs nav item always navigates to `/programs`.
- **Programs page (`ProgramsPage.tsx`)**:
  - Both sections (Flagship + Complementary) always render.
  - **Complementary courses** (free intro to Vibe Coding, etc.): always clickable, navigate to `/programs/:id`.
  - **Flagship courses**: visible with the existing "Locked" badge; clicking → opens paywall (`feature='programs'`) if `!programsAccess && !isAdmin`. Already wired — keep as-is.

### Calendar module

- **Sidebar**: Remove the "Calendar" lock. Calendar nav item always navigates to `/calendar`.
- **Calendar page (`CalendarPage.tsx`)**:
  - Page renders the full calendar grid + events for everyone.
  - When a free user clicks any event chip / event detail trigger → open paywall (`feature='calendar'`) instead of opening the booking dialog or external link.
  - Admin and users with `calendarAccess` keep the normal click behavior (open event details / book).
  - Mount one `PaywallDialog` at the page level, controlled by `usePaywall()`.

### Sidebar simplification

- `DashboardSidebar.tsx`: drop the `isLocked` / paywall logic for Build, Calendar, Programs. All three become normal `<Link>` items for everyone. Only the **Admin** item stays gated (by `isAdmin`).
- Remove the now-unused `PaywallDialog` mount and `usePaywall` hook from the sidebar.

### ProtectedRoute

- Keep the route-level access checks as a deep-link safety net (no changes), OR relax them so `/project-board`, `/calendar`, `/programs` are always accessible to authenticated users (since gating is now click-level).
- **Decision**: relax `ProtectedRoute` to allow authenticated users into `/project-board`, `/calendar`, `/programs` regardless of access flags. This matches the new "browse freely, paywall on action" model. `/admin` stays gated by `isAdmin`.

### Files changed

| File | Change |
|---|---|
| `src/components/dashboard/DashboardSidebar.tsx` | Remove paywall on Build/Calendar/Programs nav items |
| `src/components/ProtectedRoute.tsx` | Stop blocking `/project-board`, `/calendar`, `/programs` by access flags |
| `src/pages/CalendarPage.tsx` | Intercept event clicks with paywall when `!calendarAccess && !isAdmin` |
| `src/pages/ProgramsPage.tsx` | (Verify) flagship-only paywall, complementary always clickable — already correct |
| `src/components/dashboard/ArtifactsGrid.tsx` | (Verify) artifact card clicks still trigger build paywall — already correct |

### Out of scope

- Changes to `PaywallDialog.tsx` copy or `usePaywall.ts` API
- Changes to `/coaching`, `/admin`, or backend RLS
- Per-event lock badges on calendar chips (click behavior only)

