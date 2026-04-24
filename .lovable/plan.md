

## Plan: Programs-courses fixes + spec/memory updates

Three approvals received:
1. ✅ Fix cross-module Next/Prev navigation
2. ✅ Keep Layer-2 access-group filtering deferred (Option A — consistent with enrollment-access decision)
3. ✅ Update the canonical openspec text in the repo

### Code change

**`src/hooks/useLesson.ts`** — Compute prev/next across all modules in the course, not just within the current module.

- Add a query for all modules in the course (ordered by `position`) and all their lessons (ordered by `position`).
- Build a flat list `allLessons = modules.flatMap(m => m.lessons)`.
- Find the current lesson's index in that flat list.
- Set `prevLessonId = allLessons[i-1]?.id ?? null` and `nextLessonId = allLessons[i+1]?.id ?? null`.
- Keep the existing `siblings` array (same-module lessons) untouched — the lesson sidebar's "Progress" panel still scopes to the current module.
- No UI changes needed: `LessonPage`'s Next/Prev buttons already consume `prevLessonId` / `nextLessonId`.

### Documentation changes

**`mem://features/access/enrollment-model.md`** — Append one-liner: "Programs feature inherits the Layer-2 deferral — `lesson_access_groups` and `cta_access_groups` are not consulted; lessons and CTAs are visible to all users with `programs_access`."

**Canonical openspec for `programs-courses`** — I'll locate the spec source in the repo (likely under `openspec/`, `specs/`, or `docs/`) and edit it:
- **Course Detail requirement**: Remove the stale "⚠️ Michael Must Fix" warning (modules are already rendered).
- **Lesson Navigation requirement**: No spec change — code is being fixed to match spec.
- **Access Group Gating requirement**: Mark as **Planned (deferred)**. Add a note: "Layer-2 access-group filtering for lessons and CTAs is intentionally deferred — see `mem://features/access/enrollment-model`. Today all lessons and CTAs are visible to users with `programs_access`."

If the openspec source is not checked into the repo, I'll only update memory and surface the exact diff for you to apply manually.

### Files to change

| File | Change |
|---|---|
| `src/hooks/useLesson.ts` | Compute prev/next across all modules of the course |
| `mem://features/access/enrollment-model.md` | Append Programs Layer-2 inheritance note |
| Canonical `programs-courses` openspec source (path TBD on switch to default mode) | Remove stale Michael note; mark Access Group Gating deferred |

### Out of scope

- No DB schema changes.
- No activation of `lesson_access_groups` / `cta_access_groups`.
- No UI changes to `LessonPage`, `CourseDetailPage`, or `ProgramsPage`.
- No changes to `useCourseDetail` or `usePrograms`.

