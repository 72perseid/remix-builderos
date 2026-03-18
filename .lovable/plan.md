## Plan: Improve Onboarding Chat Experience

### Context

The n8n orchestrator routes messages to 3 specialists (Business Model, User Validation, Product Brief), each updating completion percentages (`bm_completion`, `uv_completion`, `pb_completion`) on `app_ideas`. The session ends when n8n returns `session_complete: true`. Currently there's no progress visibility, no quick-answer options, and every answer requires typing.

### Changes

**1. Suggestion Chips — `src/pages/OnboardingPage.tsx**`

Add context-aware quick-answer bubbles above the input (same pattern as artifact copilot):

- Map suggestions per detected phase:
  - **Business Model phase** (`bm_completion < 100`): "B2C SaaS", "Marketplace", "Subscription model", "Freemium + premium"
  - **User Validation phase** (`uv_completion < 100`): "Young professionals 25-35", "Small business owners", "Students", "Enterprise teams"  
  - **Product Brief phase** (`pb_completion < 100`): "Mobile-first app", "Web dashboard", "3-5 core features", "Launch in 3 months"
- Show chips when not streaming and last message is from assistant (or no messages yet)
- Clicking a chip sends it as a message immediately
- Also include a permanent "Skip this question" chip (styled differently, outline variant)

**2. Skip Individual Questions —** `src/pages/OnboardingPage.tsx`

- Add a "Skip this" chip that sends a special message like `"I'd like to skip this question and move on"` to n8n
- The AI will fill in sensible defaults and proceed to the next question
- Style it as an outline/ghost chip to differentiate from answer suggestions

**3. Expose Completion in** `useOnboardingChat`

The hook already tracks `bmCompletion`, `uvCompletion`, `pbCompletion` but only fetches them once on init. Add a re-fetch after each `sendMessage` response so the progress bar updates in real-time:

- In `sendMessage`, after receiving the AI response, call `fetchCompletion(appIdeaId)` if `appIdeaId` exists
- This is already partially done (line ~230) but only when the app idea is first detected

**4. n8n Consideration (outside frontend scope)**

The real bottleneck is how many questions n8n asks. You should review the n8n workflow to:

- Batch related questions (ask 2-3 at once instead of one-by-one)
- Accept shorter answers and infer details
- Target 6-8 total exchanges max instead of 15+

This is a workflow change on n8n, not a code change here.

### Files Modified

- `src/pages/OnboardingPage.tsx` — progress bar, suggestion chips, skip chip
- `src/hooks/useOnboardingChat.ts` — re-fetch completion after each message

### No database changes needed

Completion fields already exist on `app_ideas`. The hook already reads them.