## What I had wrong

I kept treating `isAdmin` as a special bypass alongside the enrollment booleans. That's not how the system is designed. Admin is just a role that controls who can open `/admin`. **Access to features is owned entirely by `access_groups` → `access_group_features`** (queried via the existing `access_group_features_view`). Whichever group a user is in determines what they unlock — admins unlock things because their group is mapped to those features, not because of a code-level shortcut.

## The single rule, used everywhere

For any gated surface (Programs, Calendar, Build/Project Board, Build/Artifacts, lesson CTAs, individual courses, individual calendars), the check is the same:

> Does the current user's `access_group_id` have a row in `access_group_features_view` with the matching `feature_slug`?

If yes → render. If no → render the blurred component + centered "talk to an expert" card (the same pattern Project Board and Artifacts already use).

No `isAdmin` short-circuit. No `programs_access` / `calendar_access` / `build_access` boolean reads from the client. Those booleans stay in the DB for backend / trigger logic, but the client stops consulting them.

## Implementation

### 1. One hook: `useUserFeatures`

Reads the existing `access_group_features_view` filtered by the user's `enrollments.access_group_id`. Returns `{ has(slug: string): boolean, loading: boolean }`. Cached per access group.

That's the only access primitive the client needs.

### 2. Standardise feature slugs

Use whatever is already in the `features` table. Based on the existing booleans the obvious slugs are `programs`, `calendar`, `build` (please confirm the exact strings you've seeded). Later, finer-grained slugs like `course.<unique_slug>`, `calendar.<id>`, `cta.<id>` can be added the same way without touching client code beyond the slug string passed in.

For this round I'm only wiring the three coarse slugs that mirror today's behaviour: `programs`, `calendar`, `build`.

### 3. Apply the same blur+overlay everywhere

Reuse the exact pattern from `ProjectBoardPage` (lines 629–676): wrap content in `cn("...", isLocked && "blur-md select-none pointer-events-none")` with `aria-hidden`, and render a centered card overlay with icon, bullets, and a "Talk to an Expert" button routing to `/coaching`. Copy comes from `PaywallDialog`'s existing `PAYWALL_COPY` map.

### 4. Pages to update

- `ProgramsPage` → `isLocked = !features.has('programs')`. Drop `course_type === "paid"` split. One uniform grid behind the blur.
- `CourseDetailPage` → same `isLocked` rule. Closes the direct-URL bypass.
- `LessonPage` → same `isLocked` rule.
- `CalendarPage` → `isLocked = !features.has('calendar')`. Replace the per-element soft-block with the full-page blur + overlay.
- `ProjectBoardPage` → swap the existing `!isAdmin && !buildAccess` check for `!features.has('build')`. Visual unchanged.
- `ArtifactsGrid` (and any other surface currently using `useEnrollment` + `useIsAdmin`) → same swap.

After this change, `useEnrollment` and `useIsAdmin` calls on these surfaces are removed. `useIsAdmin` keeps existing only to gate the `/admin` route and the sidebar admin link — that's its only job.

### 5. Loading safety

Pages must wait for `useUserFeatures.loading === false` before deciding `isLocked`, otherwise free users briefly see unlocked content. Implementation: while loading, render a skeleton/spinner instead of either branch.

### 6. Memory update

`mem://features/access/enrollment-model.md`:
- Single source of truth on the client = `access_group_features_view`.
- The boolean columns on `enrollments` (`programs_access` etc.) remain in the DB for triggers/back-office logic but are no longer read by the client.
- `isAdmin` is for the `/admin` route only, not for feature gating.

## Files touched

- `src/hooks/useUserFeatures.ts` (new)
- `src/pages/ProgramsPage.tsx`
- `src/pages/CourseDetailPage.tsx`
- `src/pages/LessonPage.tsx`
- `src/pages/CalendarPage.tsx`
- `src/pages/ProjectBoardPage.tsx`
- `src/components/dashboard/ArtifactsGrid.tsx`
- `mem://features/access/enrollment-model.md`

## What we're not doing yet

- Per-course / per-CTA / per-calendar gating. Same hook, finer slugs — added in a future pass once you confirm the slug naming convention.
- Removing the boolean columns from the DB. They stay; the client just stops reading them.
- Any admin UI for editing `access_group_features` — DB-managed, as today.

## One question before I implement

What are the exact `feature_slug` strings already seeded in your `features` table for the three top-level surfaces? I need them verbatim. Likely candidates: `programs`, `calendar`, `build` — but if you've used something different (e.g. `programs_access`, `builder_suite`) I'll match it.
