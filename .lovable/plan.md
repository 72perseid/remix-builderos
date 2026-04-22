

## Verification: chat-copilot specification

Read-only audit of the artifact Copilot against the spec.

### Verification summary

| Requirement | Status | Notes |
|---|---|---|
| Contextual Awareness — artifact type sent | ✅ Implemented | `useCopilotChat` sends `workflowMode: 'chat'` + `artifact_type` to `chat-action` (see `mem://features/copilot/chat-logic`); `chat-action/index.ts` forwards both to n8n |
| Contextual Awareness — current artifact content sent | ❌ Missing | Only the `artifact_type` string is sent. The current `artifacts.content` JSONB is **not** included in the payload, so n8n has to re-fetch context server-side |
| Suggestions surfaced | ✅ Implemented | `useCopilotChat` parses `suggestions[]` from n8n responses; `ArtifactCopilot` renders them as clickable chips (see `mem://features/copilot/suggestion-bubbles`) |
| Applying a suggestion | ✅ Implemented | Clicking a suggestion chip calls the same send handler with the suggestion text as the prompt |
| Artifact Refresh Trigger | ✅ Implemented | On every assistant response `useCopilotChat` invalidates the relevant React Query keys, causing the artifact page to re-render (see `mem://features/copilot/ui-synchronization`) |
| Independent Chat Context per artifact type | ⚠️ Partial | Session is scoped by `artifact_type` so history is logically separate, **but** the same `chat_sessions` row is reused across visits — switching pages doesn't start a *fresh* session, it loads the existing one for that artifact type. Spec says "a fresh session is started scoped to the new artifact type" |

### Gaps

**Gap 1 — Artifact content not sent as context**
`useCopilotChat` builds the payload with `{ message, session_id, workflowMode: 'chat', app_idea_id, artifact_type, attachments }`. The artifact's current `content` JSONB is never attached, so the n8n workflow operates blind unless it re-queries Supabase. Spec requires "current artifact content as context."

**Gap 2 — Session reuse vs fresh session on navigation**
Today, navigating from `/business-model` to `/product-brief` loads the persisted `chat_sessions` row for `product_brief` (resume behavior). The spec's wording — "a fresh session is started scoped to the new artifact type" — reads as *new session each visit*. Two valid interpretations:
- **A. Spec literal**: start a brand-new `chat_sessions` row every time the page mounts. Pros: matches spec wording. Cons: throws away useful history; conflicts with the existing resume-session feature already shipped (`mem://architecture/database/chat-sessions`).
- **B. Spec intent**: each artifact type has its *own* persistent session, isolated from other artifact types — which is already true today.

### Proposed fixes

1. **Inject artifact content into payload** (`src/hooks/useCopilotChat.ts`)
   - Read the latest artifact via the existing `useArtifact(artifactType)` hook (already used on artifact pages).
   - Add `artifact_content: artifact?.content ?? null` to the `chat-action` body.
   - Update `supabase/functions/chat-action/index.ts` to destructure `artifact_content` and forward it to n8n alongside `artifact_type`. No schema/auth changes.
   - Memory note: append a one-liner to `mem://features/copilot/chat-logic` documenting that `artifact_content` is now part of the chat payload.

2. **Session behavior — recommend Option B (no code change)**
   - Per-artifact persistent sessions already deliver isolated context, which is the practical intent. Update `mem://features/copilot/chat-logic` to explicitly state: "Each artifact type owns one persistent `chat_sessions` row; switching pages loads that row, never the row of another artifact type."
   - If the user prefers Option A (literal fresh session every mount), implement by creating a new `chat_sessions` row on `ArtifactCopilot` mount instead of resuming — flagged below as a question.

### Files to change (after approval)

| File | Change |
|---|---|
| `src/hooks/useCopilotChat.ts` | Pull current artifact via `useArtifact`, include `artifact_content` in payload |
| `supabase/functions/chat-action/index.ts` | Accept and forward `artifact_content` to n8n |
| `mem://features/copilot/chat-logic` | Document `artifact_content` payload + per-artifact session reuse rule |

### Out of scope

- No DB schema changes.
- No UI changes to `ArtifactCopilot` (suggestions, refresh, attachments already work).
- n8n workflow changes to *consume* `artifact_content` are outside this codebase; sending the field is forward-compatible.

### Questions

1. Approve sending the current `artifact_content` JSONB to n8n on every Copilot message? (recommended — required by spec)
2. For "Independent Chat Context": **A.** start a brand-new session every time an artifact page mounts (literal spec), or **B.** keep the current per-artifact persistent session that resumes history (recommended)?

