

## Plan: Dynamic Suggestion Chips for Artifact Copilot

### Current State
The artifact copilot (`ArtifactCopilot.tsx`) uses a hardcoded `SUGGESTIONS` map (line 13-21) keyed by context (e.g. `business_model`, `validation`). The `useCopilotChat` hook does not extract or expose suggestions from the n8n response.

### n8n Changes (you do this)
Same pattern as onboarding — include a `suggestions` array in the response body from your artifact copilot workflow path. The JSON should look like:
```json
{
  "response": "Here's my analysis...",
  "session_complete": false,
  "suggestions": ["What's my pricing model?", "Analyze competitors", "Show cost breakdown"]
}
```
If using "Respond with: All Incoming Items", ensure the last node's output includes a `suggestions` field.

### Frontend Changes (Lovable implements)

**`src/hooks/useCopilotChat.ts`**:
- Add `suggestions` state (same as onboarding hook)
- After parsing `responseData`, extract `responseData.suggestions` (JSON field first, regex fallback second)
- Expose `suggestions` from the hook return

**`src/components/artifacts/ArtifactCopilot.tsx`**:
- Import `suggestions` from the hook
- Keep the hardcoded `SUGGESTIONS` map as the **default/fallback** — shown when chat is empty or when n8n returns no suggestions
- After an assistant response, show dynamic suggestions from n8n if available; otherwise fall back to the static ones

### Files Modified
- `src/hooks/useCopilotChat.ts` — extract and expose `suggestions` from n8n response
- `src/components/artifacts/ArtifactCopilot.tsx` — use dynamic suggestions with static fallback

