

# Unified workflow_mode Detection and Chat Persistence

## Summary

Rewrite the workflow_mode logic across the edge function and both chat hooks so that **every webhook call** includes a dynamically determined `workflow_mode` based on the user's current state in Supabase. Also ensure full chat persistence (save user messages before the call, save AI responses after).

## workflow_mode Rules

```text
+---------------------------+-------------------------------------------+
| Condition                 | workflow_mode                             |
+---------------------------+-------------------------------------------+
| No app_idea_id            | "new"                                     |
| Has app_idea_id, but NOT  | "onboarded"                               |
|   all 3 artifacts done    |                                           |
| Has app_idea_id AND all   | "chat"                                    |
|   3 artifacts complete    |                                           |
+---------------------------+-------------------------------------------+

Artifacts checked: business_model, validation, product_brief
"Complete" = artifact exists with status = 'complete'
```

## Webhook Payload Shape

Every call to the n8n webhook will include:

```json
{
  "user_id": "...",
  "message": "...",
  "workflow_mode": "new" | "onboarded" | "chat",
  "app_idea_id": "..." | null,
  "app_name": "..." | null,
  "app_description": "..." | null,
  "app_category": "..." | null,
  "session_id": "..."
}
```

---

## Technical Changes

### 1. New shared utility: `src/lib/resolveWorkflowMode.ts`

A single async function used by both `useOnboardingChat` and `useChat` to determine the correct `workflow_mode` before every webhook call.

```typescript
async function resolveWorkflowMode(userId: string): Promise<{
  workflowMode: 'new' | 'onboarded' | 'chat';
  appIdeaId: string | null;
  appName: string | null;
  appDescription: string | null;
  appCategory: string | null;
}>
```

Logic:
1. Query `app_ideas` for the user (limit 1, most recent).
2. If none found, return `{ workflowMode: 'new', appIdeaId: null, ... }`.
3. If found, query `artifacts` for that `app_idea_id` where `type` is in `('business_model', 'validation', 'product_brief')` and `status = 'complete'`.
4. If all 3 artifact types are present and complete, return `workflowMode: 'chat'`.
5. Otherwise return `workflowMode: 'onboarded'`.
6. Always return `app_name`, `app_description`, `app_category` from the app_idea row.

### 2. Update `src/hooks/useOnboardingChat.ts`

- Replace the `WorkflowMode` type from `'onboarded' | 'new_app'` to `'new' | 'onboarded' | 'chat'`.
- Replace the `useEffect` mode detection with a call to `resolveWorkflowMode`.
- In `sendMessage`:
  - Before calling the edge function, **save user message to `chat_messages`** (create a `chat_session` if one doesn't exist yet, persisted in Supabase not just a ref).
  - Call `resolveWorkflowMode` fresh to get the current state.
  - Pass the full payload (including `app_name`, `app_description`, `app_category`, `workflow_mode`).
  - After receiving the response, **save assistant message to `chat_messages`**.
- On mount, create or fetch a `chat_session` from Supabase (not just a random UUID ref).
- Load existing messages from `chat_messages` for the session on mount.

### 3. Update `src/hooks/useChat.ts` (dashboard chat)

- In `sendMessageMutation`, before calling the webhook:
  - Call `resolveWorkflowMode(user.id)` to get the correct `workflow_mode`.
  - Include `workflow_mode`, `app_name`, `app_description`, `app_category` in the webhook payload.
- Remove the old `is_new_app` / `isNewAppMode` fields from the payload (replaced by `workflow_mode`).
- User message is already saved before the call (existing behavior) -- keep it.
- Assistant message is already saved after the call (existing behavior) -- keep it.

### 4. Update `supabase/functions/chat-action/index.ts`

- Accept the new `workflow_mode` field (replacing `workflowMode`).
- Accept `app_name`, `app_description`, `app_category`.
- Forward all fields to the n8n webhook.
- Remove `is_new_app` from the forwarded payload.
- Update CORS headers to include the full set of required Supabase client headers.

### 5. Files Changed Summary

| File | Change |
|------|--------|
| `src/lib/resolveWorkflowMode.ts` | **New file** -- shared utility |
| `src/hooks/useOnboardingChat.ts` | Use `resolveWorkflowMode`, add DB persistence for messages, manage real `chat_session` |
| `src/hooks/useChat.ts` | Use `resolveWorkflowMode` for payload, include app metadata |
| `supabase/functions/chat-action/index.ts` | Accept and forward `workflow_mode` + app metadata, update CORS |

No database schema changes are needed -- `chat_sessions` and `chat_messages` tables already exist with the required structure.

