

# Align Architecture: workflow_mode from DB + Completion Tracking

## Summary

The current implementation **computes** `workflow_mode` on every call by querying `app_ideas` and `artifacts`. The new architecture requires `workflow_mode` to be **stored on the profiles table** and read directly -- n8n is responsible for updating it as the user progresses. Additionally, three per-artifact completion percentages (`bm_completion`, `uv_completion`, `pb_completion`) need to be added to `app_ideas` and displayed as progress indicators in the chat UI.

## What Changes

### 1. Database Migration

Add columns to existing tables:

- **`profiles` table**: Add `workflow_mode` column (text, default `'new'`)
- **`app_ideas` table**: Add `bm_completion` (integer, default 0), `uv_completion` (integer, default 0), `pb_completion` (integer, default 0)

No new tables are needed -- `chat_sessions`, `chat_messages`, `app_ideas`, `artifacts`, and `profiles` all exist already.

### 2. Simplify `resolveWorkflowMode.ts`

Instead of computing the mode from artifacts, read `workflow_mode` directly from `profiles`:

```text
1. Query profiles.workflow_mode WHERE id = userId
2. Query most recent app_idea for metadata (app_name, etc.)
3. Return { workflowMode, appIdeaId, appName, ... }
```

This is simpler, faster (one query instead of two), and ensures Lovable always sends whatever n8n last wrote.

### 3. Add Completion Tracking to Chat UI

Read `bm_completion`, `uv_completion`, `pb_completion` from the `app_ideas` table and display three progress bars in the onboarding chat interface. These update as the user progresses through the conversation (n8n writes the values after each tool call).

- A new hook or inline query fetches completion values, polling or refetching after each message exchange
- Three labeled progress indicators (Business Model, User Validation, Product Brief) shown above the chat input or in a sidebar panel

### 4. Files Changed

| File | Change |
|------|--------|
| **Migration SQL** | Add `workflow_mode` to `profiles`, add 3 completion columns to `app_ideas` |
| `src/lib/resolveWorkflowMode.ts` | Read `workflow_mode` from `profiles` instead of computing from artifacts |
| `src/hooks/useOnboardingChat.ts` | Fetch + expose completion percentages; refetch after each message |
| `src/pages/OnboardingPage.tsx` | Render three progress indicators using completion data |
| `src/hooks/useChat.ts` | No major changes (already uses `resolveWorkflowMode`) |
| `supabase/functions/chat-action/index.ts` | No changes needed (already forwards `workflow_mode`) |

### 5. Technical Details

**Migration SQL:**
```sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS workflow_mode text NOT NULL DEFAULT 'new';

ALTER TABLE app_ideas
  ADD COLUMN IF NOT EXISTS bm_completion integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS uv_completion integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pb_completion integer NOT NULL DEFAULT 0;
```

**Updated `resolveWorkflowMode` logic:**
```text
async function resolveWorkflowMode(userId):
  1. SELECT workflow_mode FROM profiles WHERE id = userId
  2. SELECT id, app_name, app_description, app_category
     FROM app_ideas WHERE user_id = userId
     ORDER BY created_at DESC LIMIT 1
  3. Return {
       workflowMode: profile.workflow_mode ?? 'new',
       appIdeaId: appIdea?.id ?? null,
       appName, appDescription, appCategory
     }
```

**Completion polling in `useOnboardingChat`:**
- After each `sendMessage` completes, refetch `app_ideas` row to get updated `bm_completion`, `uv_completion`, `pb_completion`
- Expose these as `{ bmCompletion, uvCompletion, pbCompletion }` from the hook

**Progress UI in `OnboardingPage`:**
- Three compact progress bars rendered below the header or above the input area
- Labels: "Business Model", "User Validation", "Product Brief"
- Each shows 0-100% based on the corresponding column value

