# CTA-Driven Lesson Completion

## Goal

For lessons that have one or more CTAs, replace the manual "Mark This Lesson Complete" flow with a CTA-driven flow:

- Hide the mark-complete button and the "Lesson Completed" pill.
- Show only the CTA action button (no card title/description chrome above it).
- After the user clicks the CTA link and returns to the tab, ask "Did you complete this?".
- On Yes → mark that CTA done (per-CTA, persisted), show the completed-state card from the screenshot (title + green "Completed ✓"), and when **all** of the lesson's CTAs are confirmed, mark the lesson itself complete.
- On No → keep the CTA button as-is; popup only re-triggers after the next click.

Lessons **without** CTAs keep today's behavior (manual "Mark This Lesson Complete" button).

## Behavior matrix

| Lesson state | Right column shows |
|---|---|
| No CTAs, not completed | "Mark This Lesson Complete" button (today) |
| No CTAs, completed | "Lesson Completed" pill (today) |
| Has CTAs, none confirmed | One CTA button per CTA. No mark-complete button. No "Completed" pill. |
| Has CTAs, some confirmed | Confirmed CTAs render as title + green "Completed ✓" card (screenshot). Pending CTAs render as button only. |
| Has CTAs, all confirmed | All CTAs show as completed cards. Lesson auto-marked complete in DB. No separate "Lesson Completed" pill (the green CTA cards already convey it). |

## Files to change

### 1. `src/components/programs/LessonCTACard.tsx` (rewrite render logic)

Add two new visual states alongside the current default:

- **`variant="button-only"`** — render just the action button (current `<Button>`), no icon tile, no title, no description wrapper. Used when the CTA is pending confirmation.
- **`variant="completed"`** — render the screenshot layout: rounded card with the CTA title on the left and a green `Completed ✓` label + check icon on the right. No button.

Keep the existing default (icon + title + description + button) for backward compatibility / non-lesson use, but `LessonPage` will only use the two new variants.

Click handler stays the same (logs `cta_clicked`, opens URL in new tab). Add a new prop `onClicked?: () => void` so `LessonPage` can record "this CTA was just clicked, watch for return."

### 2. `src/pages/LessonPage.tsx` (Progress tab logic)

Replace the current Progress tab content with conditional rendering:

```text
if lesson.ctas.length === 0:
  render existing mark-complete button / completed pill
else:
  for each cta:
    if confirmedCtaIds.has(cta.id):
      <LessonCTACard variant="completed" ... />
    else:
      <LessonCTACard variant="button-only" onClicked={() => markPending(cta.id)} ... />
```

Add three pieces of local state:
- `confirmedCtaIds: Set<string>` — hydrated from localStorage on mount.
- `pendingCtaId: string | null` — the CTA the user just clicked; cleared after confirm/dismiss.
- `confirmDialogOpen: boolean`.

Add a `visibilitychange` + `focus` listener: when the document becomes visible **and** `pendingCtaId` is set, open the confirm dialog.

Confirm dialog ("Did you complete this step?" with **Yes, I did** / **Not yet** buttons — use `AlertDialog` from `@/components/ui/alert-dialog`):
- **Yes** → add `pendingCtaId` to `confirmedCtaIds`, persist to localStorage, clear `pendingCtaId`. If all `lesson.ctas` are now confirmed and `!lesson.completed`, call `markComplete.mutateAsync()`.
- **Not yet** / dismiss → just clear `pendingCtaId`. No re-prompt until user clicks the CTA again.

### 3. Persistence key

LocalStorage key: `lesson-cta-completed:${userId}:${lessonId}` storing a JSON array of confirmed CTA ids. Hydrate once when `lesson` and `user` are available; write on every confirm.

This is UI-side persistence only — server-side completion is still recorded by the existing `markComplete` mutation (which writes to `user_lesson_progress` + logs `lesson_completed`) once all CTAs are confirmed. Per-CTA confirmation tracking does not need a DB column; if the lesson is already marked complete server-side, we treat all its CTAs as confirmed on hydration so the completed-state cards show on return visits.

## Out of scope

- No DB schema changes. No new edge functions.
- The existing `cta_clicked` activity log entry is unchanged.
- Lessons without CTAs are untouched.
- Resources tab is untouched.
- Auto-mark-complete on video end is unchanged for no-CTA lessons; for CTA lessons we suppress it (video ending should not bypass the CTA confirmation flow).
