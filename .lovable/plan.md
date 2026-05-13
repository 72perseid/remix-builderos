## Goal

Rework `src/pages/ProgramsPage.tsx` so the layout matches the attached screenshot exactly: two sections — **Flagship programs** (DIA Vibe Coding MBA only, narrow card) and **Complementary Courses** (everything else, including the free intro to vibe coding) — with the wording from the screenshot.

## Layout changes

```
Flagship programs
Our signature accelerator programs designed to transform your app idea into a thriving business
[ DIA Vibe Coding MBA card — ~1/3 width, single column ]

Complementary Courses
Specialized courses to enhance specific skills and knowledge areas.
[ grid: 1 / 2 / 3 / 4 cols of small CourseCards — free + remaining paid ]
```

- Page container stays `max-w-6xl mx-auto`.
- Flagship card width: constrained to roughly one-third on desktop using a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` wrapper and rendering the single card in the first cell (so it sits at the same column width as the complementary cards below). It uses the existing `CourseCard` component (not the wide `FeaturedCourseCard`) so its width matches the screenshot.
- Complementary grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4` to match the 4-up row in the screenshot at wider widths; current viewport (1157px) renders 3-up which also matches.

## Categorization rules

- **Flagship**: courses whose `course_name` is `DIA Vibe Coding MBA` (case-insensitive trim). Falls back to: featured + paid if name match returns nothing, so renaming in the DB doesn't break it.
- **Complementary**: every other course (free featured intro + all remaining paid + free non-featured), sorted: free first, then paid.
- Drop the existing four buckets (`featuredFree`, `featuredPaid`, `freeCourses`, `paidCourses`) and the `FeaturedCourseCard` usage on this page.

## Gating (kept, scoped tighter)

- Free users still cannot open paid complementary courses. Implementation: wrap each paid card in the complementary grid with the existing blur + `LockedOverlay` pattern, but per-card instead of one big section overlay. Free cards (intro to vibe coding) and the flagship card stay fully interactive visually; click handler on locked cards already routes via `LockedOverlay`. (No change to `useUserFeatures` / `isPaidCourse` / `LockedOverlay`.)
- If you'd rather keep one combined "Premium" overlay over the whole complementary grid like today, say so and I'll do that instead — screenshot doesn't show a locked state so I'm defaulting to per-card.

## Copy changes

- Section 1 heading: `Flagship programs`
- Section 1 subtitle: `Our signature accelerator programs designed to transform your app idea into a thriving business`
- Section 2 heading: `Complementary Courses`
- Section 2 subtitle: `Specialized courses to enhance specific skills and knowledge areas.`
- Page title `Programs` and its existing top description: keep (not shown in screenshot crop, but they're outside the two sections).

## Out of scope

- No DB changes, no new images, no card visual redesign, no changes to `CourseCard` internals, no changes to gating logic in `useUserFeatures`, no changes to `/coaching` or other pages.

## Files touched

- `src/pages/ProgramsPage.tsx` (only)
