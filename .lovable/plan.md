## Goal
Auto-play the lesson video as soon as the player is ready — both when the lesson page opens and when navigating to the next lesson.

## Change
Single file: `src/pages/LessonPage.tsx`

In the `<video>` element (around line 242):
- Add `autoPlay`
- Add `playsInline` (required for mobile autoplay)
- Add `key={lesson.videoUrl}` so React remounts the player when the lesson changes, ensuring `autoPlay` re-fires on next/prev navigation
- Keep `controls`, existing handlers, and `muted` state untouched

## Notes
- Browsers block autoplay with sound. If the user reports the video not starting, the fallback is to also add `muted` (autoplay+muted is universally allowed). Not adding it by default to preserve audio on first play; we can flip if needed.
- No changes to data fetching, routing, or business logic.
