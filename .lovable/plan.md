## Goal

Close two gaps in the **lesson-content** spec:
1. Auto-complete a lesson when the video ends.
2. Log a `cta_clicked` event to `activity_log` when a user clicks any lesson CTA.

CTAs will continue to render only after lesson completion (existing behavior preserved per user request).

## Changes

### 1. Auto-complete on video end — `src/pages/LessonPage.tsx`
- Add a `handleVideoEnded` callback that:
  - Returns early if `lesson.completed` is already true or `markComplete.isPending`.
  - Calls `markComplete.mutateAsync()` and shows the same success toast as the manual button.
  - Swallows errors silently (manual button remains as fallback).
- Wire it to the `<video>` element via `onEnded={handleVideoEnded}` (line ~239).

### 2. Track CTA clicks — `src/components/programs/LessonCTACard.tsx`
- Import the supabase client.
- In `handleClick`, before navigating/opening the URL, fire-and-forget an insert into `activity_log`:
  - `event_type: 'cta_clicked'`
  - `entity_type: 'cta'`
  - `entity_id: cta.id`
  - `user_id`: from `supabase.auth.getUser()`
- Both enum values already exist in `activity_event_type` and `activity_entity_type` — no migration needed.
- Errors are logged to console only; they must not block the navigation.

## Out of scope

- Always-render CTAs (skipped per user instruction).
- Video transcript surfacing.