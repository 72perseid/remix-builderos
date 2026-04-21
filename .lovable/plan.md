

## Plan: N8N Timeout Recovery for Onboarding

When the n8n workflow takes longer than the edge-function timeout (~150s), the chat call rejects with an error and the user sees a generic failure — even when n8n actually finished writing the `app_idea` row server-side. This adds a fallback that polls `app_ideas` after a timeout/error and, if a new idea exists, transitions to the success state instead of showing an error.

### Behavior

**Happy path (unchanged):** message succeeds → assistant reply rendered → `resolveWorkflowMode` detects new app → transition to onboarded.

**Timeout path (new):**
1. `sendMessage` receives a function error or fetch timeout (>90s).
2. Hook polls `app_ideas` for up to 30s (5 attempts, 6s apart) looking for a row whose `id` is **not** in the `preExistingAppIdsRef` snapshot AND `created_at > sessionStartTimestamp`.
3. If a new row appears → treat as success: synthesize a generic assistant reply ("Got it — I've finished setting up your app."), persist it to `chat_messages`, set `appIdeaId`, link the session, mark `profiles.onboarded = true`, and return `{ text, sessionComplete: true }` so the existing UI fires the completion popup.
4. If no row appears after 30s → bubble the original error as today.

**No-bypass guarantee:** recovery only triggers on error/timeout, never on a successful response.

### Files

| File | Action |
|---|---|
| `src/lib/recoverAppIdeaAfterTimeout.ts` | **Create** — `pollForNewAppIdea(userId, knownIds, sinceISO, { attempts, intervalMs })` returns `{ id, created_at } \| null`. |
| `src/hooks/useOnboardingChat.ts` | **Edit** — wrap the `supabase.functions.invoke('chat-action', …)` call in an `AbortController` with a 90s timeout. In the `catch` branch, before re-throwing, call the poller; on hit, run the same "new app detected" branch (lines 296–328) and return `{ text, sessionComplete: true }`. Track `sessionStartedAtRef` so the poll only matches rows created during this session. |
| `src/pages/OnboardingPage.tsx` | **Edit (small)** — add a brief "Still working… verifying your app was saved" inline status during the recovery window so the UI isn't frozen silently. Reuse existing streaming spinner styling. No structural changes. |

### Implementation notes

- **Timeout source of truth:** `AbortController` wrapping the `functions.invoke`. We can't pass `signal` directly to `invoke`, so we race it against `new Promise((_, rej) => setTimeout(() => rej(new Error('TIMEOUT')), 90_000))`. Treat both `TIMEOUT` and `FunctionsHttpError`/network errors as recovery candidates.
- **Polling query:**
  ```ts
  supabase.from('app_ideas')
    .select('id, created_at, app_name')
    .eq('user_id', userId)
    .gt('created_at', sinceISO)
    .order('created_at', { ascending: false })
    .limit(5)
  ```
  Filter results client-side against `preExistingAppIdsRef` to be safe.
- **Why 90s not 150s:** Surfacing the recovery flow earlier gives the user feedback; n8n can still complete in the background and be detected by the poll.
- **Synthesized assistant message:** persisted to `chat_messages` with `metadata: { recovered: true }` for traceability.
- **Recovery state flag:** new `isRecovering` boolean exposed from the hook so `OnboardingPage` can show the "verifying…" notice instead of the generic error banner.
- **Non-recovery errors** (auth failure, validation) still throw normally — recovery only applies when timeout/network/5xx is the failure mode.

### Out of scope

- Edge function `chat-action` AbortController for the inner n8n fetch (separate concern; doesn't affect frontend recovery).
- Realtime subscription on `app_ideas` (polling is simpler and sufficient for a 30s window).

