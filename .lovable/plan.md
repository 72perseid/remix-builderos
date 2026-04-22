

## Verification: chat-onboarding specification

Result of read-only audit against the current codebase.

### Verification summary

| Requirement | Status | Notes |
|---|---|---|
| Starting a new session | ✅ Implemented | `useOnboardingChat` and `useChat` create `chat_sessions` rows on first send with correct `workflow_mode` and `app_idea_id` |
| Resuming a session | ✅ Implemented | `useChat`/copilot hooks load `chat_messages` ordered by `created_at` for the active session |
| User message persistence | ✅ Implemented | `chat_messages` row inserted with `role = 'user'` before edge call |
| Assistant response persistence | ✅ Implemented | Response inserted with `role = 'assistant'`; `suggestions` extracted by `useCopilotChat` and rendered as suggestion bubbles |
| Workflow mode routing — `new` | ✅ Implemented | Onboarding sends `workflowMode: 'new'`; on `session_complete` the `app_idea` is created and `profiles.onboarded` set to `true` (see `useOnboardingChat` + onboarding completion memory) |
| Workflow mode routing — `onboarded` | ✅ Implemented | Returning users with an active app send `workflowMode: 'onboarded'` via `resolveWorkflowMode.ts` |
| Workflow mode routing — `chat` | ✅ Implemented | Artifact copilot uses `workflowMode: 'chat'` plus `artifact_type` (per `mem://features/copilot/chat-logic`) |
| Attachment support | ⚠️ Partial | Attachments work in the **artifact copilot** (`ArtifactCopilot` / `useCopilotChat`, restricted to `ui_ux` per `mem://features/copilot/chat-attachments`), but the **onboarding chat** (`OnboardingPage` / `useOnboardingChat`) and the global **ChatSheet** have no attachment UI or payload field |

### Gaps found

**Gap 1 — Attachments not available in onboarding / global chat**
Spec says "Users SHALL be able to attach images and markdown files to messages" without restricting to artifact pages. Today only the UI/UX copilot accepts attachments. The onboarding flow and `ChatSheet` (workflow modes `new` and `onboarded`) have no paperclip button, no file state, and don't send an `attachments` array to `chat-action`.

The `chat-action` edge function already forwards `attachments` to N8N when present, so the backend contract is ready — only the client UIs are missing.

### Proposed implementation (pending approval)

1. **Shared attachment helper** — extract the existing base64 conversion + 5MB validation from `useCopilotChat` into `src/lib/chatAttachments.ts` so all three chat surfaces share the same logic and limits (5MB per file, image/* + text/markdown).
2. **Onboarding chat (`OnboardingPage` + `useOnboardingChat`)** — add a paperclip button next to the textarea, render attachment chips (filename + remove), include `attachments` in the `chat-action` payload, and persist a small `metadata.attachments` summary on the user `chat_messages` row so resumed sessions show that an image was sent.
3. **Global `ChatSheet` (`workflowMode: onboarded`)** — same paperclip + chip pattern, same payload addition.
4. **Rendering** — `ChatMessage` already handles assistant markdown; extend it to render attached image thumbnails (and a filename pill for markdown files) when `metadata.attachments` is present on a user message.
5. **Memory update** — broaden `mem://features/copilot/chat-attachments` (or add a new `mem://features/chat/attachments`) to note that attachments now work in onboarding, global chat, and UI/UX copilot, with the same 5MB / image+md limits.

### Files to change (after approval)

| File | Change |
|---|---|
| `src/lib/chatAttachments.ts` | New shared helper: validate, base64-encode, type-check |
| `src/hooks/useOnboardingChat.ts` | Accept `attachments`, include in edge payload, store metadata on user message |
| `src/pages/OnboardingPage.tsx` | Paperclip button, file input, attachment chips |
| `src/hooks/useChat.ts` | Accept `attachments`, include in edge payload, store metadata |
| `src/components/chat/ChatSheet.tsx` | Paperclip button, file input, attachment chips |
| `src/components/chat/ChatMessage.tsx` | Render image thumbnails / file pills from `metadata.attachments` |
| `src/hooks/useCopilotChat.ts` | Refactor to use the shared helper (no behavior change) |
| `mem://features/chat/attachments.md` | New memory; update `mem://index.md` reference |

### Out of scope

- No DB schema changes — attachment summaries piggyback on the existing `chat_messages.metadata` JSONB column.
- No edge function changes — `chat-action` already forwards `attachments`.
- N8N workflow updates for `new` / `onboarded` modes to consume attachments are outside this codebase; client will send the field, n8n side can adopt later without breaking.

### Question

Approve the gap fix to enable attachments in the onboarding chat and the global ChatSheet (matching the existing UI/UX copilot behavior with 5MB images + markdown)?

