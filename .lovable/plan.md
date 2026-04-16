

## Plan: Course Detail Page with Module Listing

### What we're building

A new route `/programs/:courseId` that opens when a user clicks a course card on the Programs page. It shows:

1. **Breadcrumb**: Home > Courses > [Course Name]
2. **Hero banner**: Course name, summary, overall progress bar with percentage
3. **Program Content section**: List of modules as collapsible rows, each showing:
   - Module number + duration (e.g. "Module 1 · 1 Day")
   - Emoji + title + description
   - Per-module progress bar with percentage
   - "Show details" / "Hide details" toggle
   - When expanded: horizontal scrollable lesson cards with thumbnails, title, and status badge (Not Started / Completed)

### Data

- Reuse `usePrograms` hook logic but create a dedicated `useCourseDetail(courseId)` hook that fetches:
  - Course info from `courses`
  - Modules for that course from `modules` (ordered by `position`)
  - Lessons per module from `lessons` (ordered by `position`)
  - User progress from `user_lesson_progress`
- Computes per-module and overall progress percentages

### Files to create/modify

| File | Action |
|------|--------|
| `src/hooks/useCourseDetail.ts` | Create — fetch course, modules, lessons, progress |
| `src/pages/CourseDetailPage.tsx` | Create — full UI matching reference screenshot |
| `src/App.tsx` | Add `/programs/:courseId` route |
| `src/layouts/DashboardLayout.tsx` | Add `/programs/` prefix to `hideTopNav` check |
| `src/pages/ProgramsPage.tsx` | Make course cards navigate to `/programs/:courseId` |

### UI details (matching reference screenshot)

- **Hero banner**: Dark card (`bg-card border-border`), course name as heading, summary as subtitle, green progress bar with percentage
- **Module rows**: Dark bordered cards, collapsed by default. Header row has module number, duration pill, emoji, title, description, progress bar, and toggle button
- **Expanded lesson cards**: Horizontal scroll container with cards showing thumbnail (or gradient placeholder), status badge ("Not Started" / "Completed" with colored dot), and lesson title at bottom
- **Breadcrumb**: Uses existing breadcrumb component or simple links at top
- Responsive: cards stack on mobile, horizontal scroll on desktop

### Navigation flow

```text
/programs (ProgramsPage)
    │ click course card
    ▼
/programs/:courseId (CourseDetailPage)
    │ breadcrumb "Courses" link
    ▼
/programs (back)
```

