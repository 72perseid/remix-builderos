
# Auto-Trigger Master Prompt Generation via Copilot Webhook

## Overview

Update the Master Prompt page so that clicking "Generate Master Prompt" automatically sends a message to the n8n copilot webhook instead of just showing a toast.

---

## Current Flow

```text
User clicks "Generate Master Prompt"
        ↓
Toast: "Use the AI Assistant on the right..."  (not helpful)
```

## New Flow

```text
User clicks "Generate Master Prompt"
        ↓
Calls chat-action edge function with:
  - context: "master_prompt"
  - workflowMode: "copilot"
        ↓
Routes to: https://amblabsdevaccount.app.n8n.cloud/webhook/158807ed-...
        ↓
n8n generates and saves master_prompt artifact
        ↓
Page refetches and displays content
```

---

## Technical Changes

### File: `src/pages/MasterPromptPage.tsx`

1. **Import the hook**
   ```typescript
   import { useCopilotChat } from '@/hooks/useCopilotChat';
   ```

2. **Use the hook in the component**
   ```typescript
   const { sendMessage, isLoading: isGenerating } = useCopilotChat({
     context: 'master_prompt',
     onArtifactRefresh: refetchArtifact,
   });
   ```

3. **Update the generate handler**
   ```typescript
   const handleGeneratePrompt = async () => {
     await sendMessage('Generate my master prompt by combining all my project artifacts');
   };
   ```

4. **Update the button**
   - Show loading state while generating
   - Disable button during generation

   ```typescript
   <Button 
     variant="default" 
     size="lg"
     className="gap-2"
     onClick={handleGeneratePrompt}
     disabled={isGenerating}
   >
     {isGenerating ? (
       <>
         <Loader2 className="w-4 h-4 animate-spin" />
         Generating...
       </>
     ) : (
       <>
         <Sparkles className="w-4 h-4" />
         Generate Master Prompt
       </>
     )}
   </Button>
   ```

---

## Summary

| Change | Description |
|--------|-------------|
| Import `useCopilotChat` | Access the copilot webhook integration |
| Call `sendMessage()` on button click | Triggers the n8n workflow |
| Add loading state | Shows spinner during generation |
| `onArtifactRefresh` callback | Refetches artifact after n8n completes |

This will send the request through the existing `chat-action` edge function which routes `workflowMode: 'copilot'` to the webhook: `https://amblabsdevaccount.app.n8n.cloud/webhook/158807ed-765b-4429-aa08-3688f7122393`
