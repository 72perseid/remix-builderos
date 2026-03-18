

## Plan: Dynamic AI-Driven Suggestion Chips

### Problem
The current suggestion chips are hardcoded per phase and don't relate to the actual question the AI just asked. They feel generic and unhelpful.

### Solution
Have n8n return suggestion chips alongside each response. The n8n response payload changes from:

```json
{ "response": "...", "session_complete": "false" }
```

to:

```json
{ "response": "...", "session_complete": "false", "suggestions": ["Construction", "Productivity", "Healthcare"] }
```

The frontend reads `suggestions` from the response and displays them instead of the hardcoded `PHASE_SUGGESTIONS`.

### Changes

**1. n8n workflow (outside this codebase)**
- Each specialist tool response should include a `suggestions` array of 2-4 short strings representing the most likely answers to the question just asked.
- If the AI asks "tag it as Construction or Productivity?", it returns `suggestions: ["Construction", "Productivity"]`.

**2. `src/hooks/useOnboardingChat.ts` — Parse and expose suggestions**
- Add a `suggestions` state (`string[]`, default `[]`).
- After parsing each AI response, read `responseData?.suggestions` (expecting an array of strings). Update the state.
- Clear suggestions when a user sends a message (set to `[]`).
- Return `suggestions` from the hook.

**3. `src/pages/OnboardingPage.tsx` — Use dynamic suggestions**
- Remove the `PHASE_SUGGESTIONS` constant entirely.
- Read `suggestions` from `useOnboardingChat()` instead.
- Keep the "Skip this question" chip as a static addition.
- Keep the same rendering logic (show chips when not streaming and last message is from assistant), but use the dynamic array.
- Fallback: if `suggestions` is empty, show no chips (or optionally keep a small set of generic fallbacks).

**4. `supabase/functions/chat-action/index.ts` — No changes needed**
- The edge function already passes through the full JSON response from n8n. The `suggestions` field will flow through automatically.

### Files Modified
- `src/hooks/useOnboardingChat.ts` — add `suggestions` state, parse from response
- `src/pages/OnboardingPage.tsx` — remove hardcoded suggestions, use hook's dynamic array

### n8n Requirement
You will need to update the n8n workflow so each specialist tool returns a `suggestions` array in its output. This is the critical piece that makes the chips contextual.

