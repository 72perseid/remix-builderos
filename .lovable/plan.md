

## Plan: Inline CTA Card with Post-Completion Attention Animation

Combine Idea 1 (inline placement under video) with Idea 3 (post-completion emphasis) by rendering CTAs as a card directly below the video player, and animating it when the lesson is marked complete to draw the user's eye.

### Placement

```text
┌─────────────────────────────┐
│   [ Video Player ]          │
├─────────────────────────────┤
│   [ CTA Card(s) ] ← here    │  ← idle: subtle border
│                             │  ← on complete: pulse ring + scale-in
├─────────────────────────────┤
│   Lesson Title              │
│   Description               │
└─────────────────────────────┘
```

### Behavior

- **Idle state**: Card sits below the video with a normal border, icon (LinkIcon for `external_link`, Sparkles for `upgrade`), title, optional description, and CTA button on the right.
- **Completed state**: Card animates with:
  - A one-time `scale-in` + `fade-in` emphasis when `completed` flips to true (tracked via `useEffect` on `lesson.completed`).
  - A persistent soft pulsing ring (`ring-2 ring-primary/40` with `animate-pulse`) while the lesson is complete to keep attention on the next action.
  - For `upgrade` CTAs, gradient accent background (`from-primary/10 to-primary/5`) becomes more saturated.

### Files

| File | Action |
|---|---|
| `src/hooks/useLesson.ts` | **Edit** — fetch CTAs ordered by `position` for the current `lesson_id` and include them on `LessonData` as `ctas: LessonCTA[]`. |
| `src/components/programs/LessonCTACard.tsx` | **Create** — renders a single CTA with idle/completed visual states. Props: `cta`, `completed`. |
| `src/pages/LessonPage.tsx` | **Edit** — render `lesson.ctas.map(...)` in a stack directly under the video, above the lesson title. Only render the block if `ctas.length > 0`. Pass `completed={lesson.completed}` so the card knows when to animate. |

### Implementation notes

- **Type**: `LessonCTA = { id, cta_type: 'external_link' | 'upgrade', title, description, cta_label, url, position }`.
- **Query**: Add a parallel `supabase.from('ctas').select('...').eq('lesson_id', lessonId).order('position')` to the existing `Promise.all` in `useLesson`.
- **Animation trigger**: In `LessonCTACard`, use `useEffect(() => { if (completed) setJustCompleted(true); const t = setTimeout(() => setJustCompleted(false), 1200); return () => clearTimeout(t); }, [completed])` to fire the one-time `animate-scale-in` flash, while the persistent `ring + animate-pulse` stays as long as `completed` is true.
- **Button**: For `external_link`, render an anchor `target="_blank"`. For `upgrade`, route to `/coaching` (or `cta.url` if provided), styled with a primary gradient button.
- **Empty state**: If a lesson has no CTAs, nothing renders — no spacing impact.
- **Reusability**: `LessonCTACard` is self-contained, so it can later be moved to the sidebar or post-completion slot without changes.

