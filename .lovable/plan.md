

## Hide "Skip this question" when no suggestions from n8n

### Change

**File: `src/pages/OnboardingPage.tsx`**

Currently, `showChips` controls the entire suggestion area (line 458), and the "Skip this question" button always renders inside it. The fix: only show "Skip this question" when the `suggestions` array has at least one item. This way, when n8n returns no suggestions, the entire chip area (including skip) is hidden.

Update `showChips` (line 299) to also require `suggestions.length > 0`:

```ts
const showChips = !isStreaming && !isFinalizing && !isSessionComplete &&
  suggestions.length > 0 &&
  (messages.length === 0 || messages[messages.length - 1]?.role === 'assistant');
```

**1 file, 1 line changed.**

