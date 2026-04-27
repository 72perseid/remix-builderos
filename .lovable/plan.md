## Plan: Programs + Lesson page UI overhaul (revised v2)

### 1. Hide sidebar on Lesson page only

**`src/layouts/DashboardLayout.tsx`**
- Keep `DashboardSidebar` on `/programs` (list) and `/programs/:courseId` (course detail).
- Hide `DashboardSidebar` only on lesson pages (path matches `/programs/.+/lessons/`).
- Top nav already hidden on `/programs*` — no change.

### 2. Auto-open active module on Course Detail page

**`src/pages/CourseDetailPage.tsx`**

When the URL has no `#module-...` hash, pick a module to expand by default:
- Priority 1: First module with a lesson that is `started` and not `completed`.
- Priority 2: First module with at least one incomplete lesson.
- Priority 3: First module.

Pass `defaultOpen` to that single `ModuleRow`. Gate the existing auto-scroll effect to only fire when the user deep-linked via hash (no scroll-jacking on plain navigation).

### 3. Redesign Lesson page

**`src/pages/LessonPage.tsx`**

**Top bar (right side)** — three pill controls per screenshot 1:
- Round outline icon button: `«` prev — disabled when no prev.
- Pill (text-only): `Lesson X of N` — counts across the whole course.
- Pill button: `Next Lesson »` — disabled when no next.
- Pill button with chevron-down: `All Lessons` — toggles the section panel.

**"All Lessons" panel** (per screenshot 2) — shadcn `Popover` anchored to the All Lessons button, aligned to the right edge:
- Wide panel (~`w-[420px]`), rounded-xl, border with subtle primary glow, dark card bg.
- Header: title `In this section` + `×` close button + thin separator.
- Scrollable list of the **current module's lessons** (`max-h-[70vh] overflow-y-auto`).
- Each row: thumbnail box (~`w-28 h-16` rounded-lg) using lesson `thumbnail` URL or dynamic `<LessonThumbnail title={...} />` fallback; right side has lesson title + `Lesson N` subtitle. Whole row navigates; current lesson highlighted; completed gets a small check overlay.

**Main content area**
- Single column, centered with `max-w-5xl`.
- Order: video → title → description → text_content.
- **No CTAs, no buttons, no resources card** below the video.

**New right-hand action card** (per screenshot 1) — placed beside the main content area in a compact column:
- Rounded-xl bordered card with two stacked pill segments inside: a `Tabs` segmented control with `Progress` and `Resources`, then the active tab's content beneath it.
- **Progress tab**: shows the `Mark This Lesson Complete` button (full-width, primary, rounded-full pill style with check icon) when not completed, OR the green `Lesson Completed` badge state when completed.
- **Resources tab**: shows the lesson's CTAs (existing `LessonCTACard` items) and resource links (title + external-link icon row) in a single combined list. Empty state: muted `No resources for this lesson.` text.

Layout: two-column grid on `lg+` (e.g. `lg:grid-cols-[1fr_360px]`); stacks on mobile with the action card moving below the content.

**Removed**
- Old right sidebar (Progress list card, Resources card, standalone Mark Complete button, standalone Next Lesson button).
- Inline CTAs and resources rendered under the video in the main column.

### Data wiring

**`src/hooks/useLesson.ts`**
- Extend the existing course-modules query select to include `title, thumbnail` on lessons so we can power both the popover and the `Lesson X of N` counter without extra requests.
- Add derived `courseLessons: { id, title, position, moduleId, completed, thumbnail }[]` and use its length/index for the counter.
- Add `thumbnail` field to module-scoped `siblings` (extend the siblings query select) for the popover thumbnails.

### Technical notes

- All new UI uses semantic tokens (no hardcoded colors). Pills use `Button variant="outline"` + `rounded-full`; ghost variant for the text-only counter pill.
- Tabs use existing shadcn `Tabs`, restyled as a rounded-full segmented pill (rounded-full container, rounded-full active state) to match the screenshot.
- `Next Lesson` pill is enabled regardless of completion (pure nav).
- Resources tab combines `ctas` and `resources` since the action area replaces both prior surfaces; CTAs render via existing `LessonCTACard`, resources render as compact link rows.

### Files changed

| File | Change |
|---|---|
| `src/layouts/DashboardLayout.tsx` | Hide sidebar only on `/programs/:id/lessons/:id` |
| `src/pages/CourseDetailPage.tsx` | Auto-pick & expand active module when no hash; gate hash auto-scroll |
| `src/hooks/useLesson.ts` | Add `courseLessons` (title, thumbnail, completed); add `thumbnail` to `siblings` |
| `src/pages/LessonPage.tsx` | New top-bar pills + `In this section` popover; right-hand Progress/Resources tab card; clean main column to title/description only |

### Out of scope

- No DB / RLS changes.
- No changes to `ProgramsPage`, `LessonCTACard`, `LessonThumbnail`, `useCourseDetail`, or video logging.
- No mobile-specific redesign — single-column stack falls out naturally; pills wrap if needed.
