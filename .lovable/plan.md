## Plan: Activate Layer-2 lesson access-group filtering

### Context

- 108 active lessons; 306 rows in `lesson_access_groups` — most lessons exist in 3 tier variants (Starter / Academy / Accelerator) plus a few Free.
- Confirmed example: module `2e3e...a921` has two `How to Use Discord` lessons — one tagged `tier2` (Academy), one `tier3` (Accelerator).
- Today the client ignores `lesson_access_groups`, so users see both copies (the screenshot's duplicate "How to Use Discord" cards).
- Each user has exactly one `access_group_id` on their active enrollment (`useEnrollment` already fetches the active row — we'll extend it).

### Filtering rule

A lesson is visible to the user when **either**:
1. `lesson_access_groups` has no row for that lesson (untagged → visible to everyone with `programs_access`), OR
2. `lesson_access_groups` has a row matching the user's enrollment `access_group_id`.

Admins (via `has_role admin`) bypass the filter and see every lesson.

This eliminates duplicates because each tier variant is tagged to a different group, so only the user's tier passes.

### Code changes

**`src/hooks/useEnrollment.ts`**
- Extend the select to include `access_group_id`.
- Return `accessGroupId: string | null` alongside the existing booleans.

**`src/hooks/useCourseDetail.ts`**
- Accept the user's `accessGroupId` (read via `useEnrollment` inside the hook) and `isAdmin` (via `useIsAdmin`).
- After fetching `lessons`, fetch their `lesson_access_groups` rows in one query (`.in('lesson_id', lessonIds)`).
- Build `lessonGroupsMap: lessonId -> Set<access_group_id>`.
- Filter lessons: keep when `isAdmin`, or when the lesson has no rows in the map, or when the map's set contains `accessGroupId`.
- Recompute `totalLessons`, `completedLessons`, and per-module progress from the filtered list (so progress reflects what the user actually sees).
- Include `accessGroupId` and admin flag in the React Query `queryKey` so the cache splits per user/role.

**`src/hooks/useLesson.ts`**
- Same join in the existing course-modules query (extend the select to include `lesson_access_groups(access_group_id)`).
- Filter both `siblings` (module-scoped list) and `courseLessons` (course-wide list used by the `Lesson X of N` counter and Next/Prev navigation) using the same rule.
- This makes Next/Prev skip lessons the user can't see and keeps the counter accurate.
- Direct lesson access by URL: if a user opens a lesson UUID outside their group, the lesson detail still loads (we don't block it explicitly — the visibility filter only affects listings/navigation). Acceptable for now; matches the deferred "browse-everywhere" stance for everything else. (Out of scope: hard 404 / paywall on direct nav.)

**`src/hooks/usePrograms.ts`** (Programs landing page)
- Apply the same filter when computing per-course progress / lesson counts so cards reflect what the user actually has.
- Will inspect the file first to confirm shape, then apply the same join + filter pattern.

### Memory update

**`mem://features/access/enrollment-model.md`** — flip the Programs Layer-2 status:
- Update the "Programs feature inheritance" section to note `lesson_access_groups` is now ENFORCED in `useCourseDetail`, `useLesson`, and `usePrograms`. Untagged lessons are visible to all users with `programs_access`. CTAs (`cta_access_groups`) and other Layer-2 surfaces remain deferred.
- Update the top-of-file summary line accordingly.

### Files changed

| File | Change |
|---|---|
| `src/hooks/useEnrollment.ts` | Return `accessGroupId` |
| `src/hooks/useCourseDetail.ts` | Fetch `lesson_access_groups`; filter lessons; recompute progress; admin bypass |
| `src/hooks/useLesson.ts` | Same filter applied to `siblings` and `courseLessons` (counter + nav) |
| `src/hooks/usePrograms.ts` | Same filter applied to course-level lesson counts/progress |
| `mem://features/access/enrollment-model.md` | Mark Programs Layer-2 as ENFORCED |

### Out of scope

- No DB / RLS changes (RLS already permits SELECT for all authenticated users on `lesson_access_groups` was empty in policy list — will rely on the implicit "RLS enabled, no SELECT policy = no rows" behavior; need to verify and add a SELECT policy `USING (true)` if reads return empty).
- CTA filtering (`cta_access_groups`) stays deferred.
- No hard block on direct lesson URLs outside the user's group (visibility-only filtering for now).
- No admin UI for editing lesson access groups.
