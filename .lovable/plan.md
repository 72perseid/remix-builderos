

## Plan: Detect Onboarding Completion from AI Message Content

### Problem
The completion popup only triggers when `session_complete: true` is in the n8n response payload. But the AI often sends clear "onboarding is complete" messages without that flag, so users see the farewell message but no popup or redirect.

### Solution
Add a client-side content detection fallback in `handleSendMessage`. After receiving the AI response, if `sessionComplete` is false, check the response text against completion keywords. If matched, treat it as session complete.

### Changes — `src/pages/OnboardingPage.tsx`

1. **Add a helper function** to detect completion phrases in AI responses:
   ```ts
   const isCompletionMessage = (text: string): boolean => {
     const lower = text.toLowerCase();
     const patterns = [
       'onboarding is complete',
       'onboarding for',
       'you\'re all set',
       'you\'ve finished onboarding',
       'everything for onboarding is complete',
       'finished onboarding',
     ];
     return patterns.some(p => lower.includes(p));
   };
   ```

2. **Update `handleSendMessage`** (around line 126) — after the existing `if (response.sessionComplete)` block, add an `else if` that checks `isCompletionMessage(response.text)` and runs the same completion logic (set `isSessionComplete`, update profile).

No new files. ~15 lines added.

