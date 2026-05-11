## Goal
On `/programs`, free / no-access users (no `programs` USE) should:
- **Still see and use free courses normally** (click to open, track progress).
- See **paid courses** rendered as a blurred section with **one shared centered "Unlock our Programs" overlay** on top — matching the screenshot pattern.

Paid users (with `programs` USE) keep seeing everything unlocked.

## Approach
Split the courses into `freeCourses` and `paidCourses` using the existing `isPaidCourse()` helper. Render the free ones as today, then render the paid ones inside a relatively-positioned wrapper that — when the user lacks `programs` USE — applies `blur-md select-none pointer-events-none` to the paid grid and stacks a single centered `LockedOverlay feature="programs"` card on top (same component used on `/project-board`, with the requested "Unlock our Programs" copy + "Talk to an Expert" CTA → `/coaching`).

## Changes (single file: `src/pages/ProgramsPage.tsx`)

1. Remove the per-card lock UI:
   - Delete the `ProgramCardLockOverlay` component.
   - Remove the `locked` prop and all its branches from `CourseCard` and `FeaturedCourseCard` (no blur wrapper, no overlay, no click guard).
   - Drop the `Lock` icon import.

2. Import `LockedOverlay` from `@/components/paywall/LockedOverlay`.

3. In `ProgramsPage`:
   - Keep `useUserFeatures` and compute `canUsePrograms = hasUse('programs')`.
   - Partition non-featured courses: `freeCourses = courses.filter(c => !c.is_featured && !isPaidCourse(c))`, `paidCourses = courses.filter(c => !c.is_featured && isPaidCourse(c))`.
   - Do the same partition for featured courses (`featuredFree`, `featuredPaid`).
   - Render order:
     1. Featured free cards (unchanged).
     2. Free non-featured grid (unchanged).
     3. **Paid section** — rendered only if `paidCourses.length + featuredPaid.length > 0`:
        - Heading e.g. `Premium Programs`.
        - Wrapper `<div className="relative">` containing the featured-paid + paid grid.
        - If `!canUsePrograms`: add `blur-md select-none pointer-events-none` + `aria-hidden` to the inner content, and absolutely-position `<LockedOverlay feature="programs" />` inside the wrapper (the existing `LockedOverlay` already uses `absolute inset-0`).
        - If `canUsePrograms`: render the inner content with no blur and no overlay.

4. Keep the empty-state branch for when there are zero courses total. If only paid courses exist for a free user, the page still renders the heading + blurred grid + overlay (no empty state).

## Out of scope
- No routing, sidebar, or DB changes.
- `CourseDetailPage` lesson-level gating is unchanged (separate concern).
- `isPaidCourse` / `programAccess.ts` stay as-is.
