

## Plan: Debug Missing Suggestion Chips

### Analysis

The code is wired correctly:
- `useOnboardingChat.ts` line 228-229 parses `responseData?.suggestions` and sets state
- `OnboardingPage.tsx` line 440-457 renders the `suggestions` array as chips
- The edge function passes through the full n8n JSON response unchanged

The "Skip this question" chip **is** appearing (visible in your screenshot), confirming `showChips` evaluates to `true`. The issue is that the `suggestions` array is empty when it reaches the frontend.

### Most Likely Cause

The n8n response may be arriving with a different structure than expected at the client. For example, the edge function could be double-wrapping the array, or the `supabase.functions.invoke` auto-parsing may interact unexpectedly.

### Fix

**`src/hooks/useOnboardingChat.ts`** — Add deeper debug logging and more robust suggestions extraction:

1. Add a `console.log` specifically for the suggestions field after parsing: `console.log('Suggestions extracted:', responseData?.suggestions)`
2. Also handle the case where `data` itself (before array unwrap) has suggestions, or where the response is nested one level deeper (e.g. `data[0][0]` if double-wrapped)

**`supabase/functions/chat-action/index.ts`** — Add a `hasSuggestions` field to the existing debug log so we can confirm suggestions reach the edge function:

```
hasSuggestions: Array.isArray(data?.suggestions) || (Array.isArray(data) && Array.isArray(data[0]?.suggestions))
```

These are small, low-risk changes that will immediately reveal where the suggestions are getting lost.

### Files Modified
- `src/hooks/useOnboardingChat.ts` — add suggestions debug logging + deeper extraction
- `supabase/functions/chat-action/index.ts` — add suggestions to debug log

