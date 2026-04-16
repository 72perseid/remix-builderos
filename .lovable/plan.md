

## Plan: Build the Programs Page

### What we're building

A programs page matching the reference screenshot's layout — dark theme, with two sections:
1. **Flagship Programs** — large cards for main courses (e.g., "DIA Vibe Coding MBA")
2. **Complementary Courses** — smaller cards in a 4-column grid for free/secondary courses

Each course card shows: thumbnail, tags, title, summary, progress bar (from `user_lesson_progress`), and a "Continue" button.

### Data

From the database:
- **1 program**: "Ambitious Labs Core"
- **2 courses**: "DIA Vibe Coding MBA" (paid, 97 lessons) and "Free Intro to Vibe Coding" (free, 1 lesson)
- Both have thumbnails and tags
- Progress is computed from `user_lesson_progress` vs total lesson count per course

### Database changes

**1. Add RLS SELECT policies** so authenticated users can read course content:

```sql
-- courses, modules, lessons, programs all need SELECT for authenticated users
CREATE POLICY "authenticated users view courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated users view modules" ON public.modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated users view lessons" ON public.lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated users view programs" ON public.programs FOR SELECT TO authenticated USING (true);
```

### Frontend changes

**1. Create `src/hooks/usePrograms.ts`**
- Fetch programs with nested courses, modules, lessons
- Fetch user's `user_lesson_progress` to compute per-course completion %
- Return `{ programs, courses, progressMap, loading }`

**2. Rewrite `src/pages/ProgramsPage.tsx`**
- **Flagship section**: Courses where `course_type = 'paid'` — large card with thumbnail, tag pills, title, summary, progress bar, "Continue" button
- **Complementary section**: Courses where `course_type = 'free'` — smaller thumbnail cards in a responsive grid
- Progress bar: green dot + percentage + bar (matching the reference)
- Dark card styling consistent with the app's design system (`bg-[#141922]`, `border-slate-700/50`)
- Cards are non-navigational for now (no course detail page yet) — "Continue" button is a placeholder

### Design details

- Section headings: bold white text with muted subtitle
- Tag pills: dark rounded badges (`bg-slate-700/60 text-slate-300`)
- Progress: green accent (`bg-emerald-500`), percentage label left, bar right
- Card hover: subtle lift/glow effect
- Responsive: flagship cards full-width on mobile, complementary 2-col on tablet, 4-col on desktop

### Files changed

| File | Action |
|------|--------|
| Migration | Add 4 RLS SELECT policies |
| `src/hooks/usePrograms.ts` | Create — data fetching |
| `src/pages/ProgramsPage.tsx` | Rewrite — full programs UI |

