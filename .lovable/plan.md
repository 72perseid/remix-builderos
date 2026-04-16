

## Plan: Lesson Detail Page with Video Player and Activity Logging

### What we're building

A new route `/programs/:courseId/lessons/:lessonId` that shows a lesson view matching the reference screenshot:

1. **Top breadcrumb bar**: Course > Module > Lesson title, with Prev/Next lesson navigation and "All Lessons" dropdown
2. **Main area (left)**: Video player (HTML5 `<video>`) with the lesson's video URL from the `videos` table, plus lesson title and description below
3. **Sidebar (right)**: Two tabs — "Progress" (module completion status) and "Resources" (links from `resources` table), plus a "Mark This Lesson Complete" button
4. **Video watch logging**: Log `video_watched` events to the `activity_log` table as the user watches

### Database changes

**1. Migration: Add enum values and RLS policies**

- Add `video_watched` to the `activity_event_type` enum  
- Add `video` to the `activity_entity_type` enum  
- Add RLS SELECT policy on `videos` for authenticated users (currently admin-only)
- Add RLS SELECT policy on `resources` for authenticated users (currently admin-only)

```sql
ALTER TYPE public.activity_event_type ADD VALUE IF NOT EXISTS 'video_watched';
ALTER TYPE public.activity_entity_type ADD VALUE IF NOT EXISTS 'video';

CREATE POLICY "authenticated users view videos"
  ON public.videos FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated users view resources"
  ON public.resources FOR SELECT TO authenticated USING (true);
```

**2. Migration: Add RLS policy on `ctas` for authenticated SELECT**

The CTAs table currently only allows admin access — users need SELECT to see lesson CTAs.

```sql
CREATE POLICY "authenticated users view ctas"
  ON public.ctas FOR SELECT TO authenticated USING (true);
```

### Frontend changes

**1. Create `src/hooks/useLesson.ts`**
- Fetch lesson details (title, description, text_content) from `lessons`
- Fetch video URL from `videos` table by `lesson_id`
- Fetch resources from `resources` table by `lesson_id`
- Fetch completion status from `user_lesson_progress`
- Fetch all lessons in the same module for prev/next navigation
- Fetch module and course names for breadcrumb
- Provide `markComplete()` mutation that inserts into `user_lesson_progress`
- Provide `logVideoWatch(lessonId)` function that inserts into `activity_log`

**2. Create `src/pages/LessonPage.tsx`**

Layout matching the reference:
- **Breadcrumb bar** (sticky top): Home icon → Course name → Module name → Lesson title. Right side: "Lesson X of Y", Prev/Next buttons, "All Lessons" dropdown
- **Two-column layout**: 
  - Left (~65%): HTML5 `<video>` player with controls, lesson title + description below
  - Right (~35%): Card with "Progress" / "Resources" tabs and "Mark This Lesson Complete" button
- Progress tab: Shows module lessons with completion checkmarks
- Resources tab: List of linked resources with icons
- Video `onTimeUpdate` event fires periodic activity log entries (throttled, e.g., every 30s or at key milestones like 25%, 50%, 75%, 100%)

**3. Update `src/App.tsx`**
- Add route: `/programs/:courseId/lessons/:lessonId`

**4. Update `src/pages/CourseDetailPage.tsx`**
- Make lesson cards clickable, navigating to `/programs/:courseId/lessons/:lessonId`

### Activity logging approach

- On video play/progress, throttle writes to `activity_log` with `event_type = 'video_watched'`, `entity_type = 'video'`, `entity_id = video.id`
- On "Mark This Lesson Complete": insert into `user_lesson_progress` and log `event_type = 'lesson_completed'`, `entity_type = 'lesson'`, `entity_id = lesson.id`

### Files changed

| File | Action |
|------|--------|
| Migration | Add enum values + RLS policies for videos, resources, ctas |
| `src/hooks/useLesson.ts` | Create — lesson data, video, resources, navigation, mutations |
| `src/pages/LessonPage.tsx` | Create — full lesson viewer UI |
| `src/App.tsx` | Add `/programs/:courseId/lessons/:lessonId` route |
| `src/pages/CourseDetailPage.tsx` | Make lesson cards link to lesson page |

