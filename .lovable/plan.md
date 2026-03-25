

## Revised Plan: Image Upload & Stitch AI Import for UX Designer Chat

### Overview

Two features for the UX Designer copilot chat:
1. **Image upload** — Attach screenshots/photos for visual context
2. **Stitch AI import** — Paste a design template (screenshot or MD file) to extract design details

### UI Hints for Limits

Yes — the UI will show clear hints:

- **File size limit toast**: If a file exceeds 5MB, a toast appears: "File too large. Max 5MB per file."
- **Attachment count**: If user tries to add a 4th file, toast: "Max 3 attachments per message."
- **Tooltip on paperclip button**: "Attach image or .md file (max 5MB, up to 3)"
- **Accepted formats hint**: Small helper text below the attachment preview area: "PNG, JPG, WEBP, or Markdown • Max 5MB each"

### n8n Backend Changes Required

The frontend sends a new `attachments` array in the payload to the Edge Function, which forwards it to n8n. Here's what needs to happen on the n8n side:

**1. Updated payload structure received by n8n:**
```json
{
  "message": "Use this color palette from my Stitch design",
  "user_id": "...",
  "session_id": "...",
  "workflowMode": "chat",
  "app_idea_id": "...",
  "artifact_type": "ui_ux",
  "attachments": [
    {
      "type": "image",
      "name": "stitch-export.png",
      "data": "data:image/png;base64,iVBOR..."
    },
    {
      "type": "markdown",
      "name": "design-system.md",
      "data": "# Design System\n## Colors\n- Primary: #4A90E2..."
    }
  ]
}
```

**2. n8n AI Agent / Sandro_UX tool updates:**

- **Add an input check** in the Sandro_UX tool node: if `attachments` exists and is non-empty, include them in the AI prompt context
- **For images** (`type: "image"`): Pass the base64 data as an image input to the AI model (GPT-4o / Claude support vision). The system prompt should instruct: *"Analyze the attached image for colors, typography, spacing, layout patterns, and component styles. Extract these into the design system."*
- **For markdown** (`type: "markdown"`): Inject the raw text directly into the prompt context with instructions: *"The user has provided a Stitch AI design template. Parse the design details (colors, fonts, spacing, components) and incorporate them into the current design system artifact."*
- **Updated system prompt addition for Sandro_UX**:
  ```
  When the user attaches images or markdown files:
  - Extract color hex codes, font names, spacing values, and component patterns
  - Merge extracted details with the existing design system in the artifact
  - Confirm what was extracted and incorporated in your response
  ```

**3. No new n8n nodes needed** — the existing webhook receives the expanded payload, and the Sandro_UX tool just needs its prompt updated to handle the `attachments` field. If using GPT-4o vision, ensure the image is passed as a `image_url` content block in the messages array.

### Files to Change (Frontend)

| File | Change |
|------|--------|
| `src/hooks/useCopilotChat.ts` | Add `Attachment` type, update `sendMessage` to accept attachments, include in payload |
| `src/components/artifacts/ArtifactCopilot.tsx` | Paperclip button (ui_ux only), file input, preview chips, validation toasts, tooltips, limit hints |
| `supabase/functions/chat-action/index.ts` | Extract and forward `attachments` array to n8n webhook |

### Scope
- **3 frontend files** modified (~120 lines)
- **n8n**: Update Sandro_UX tool system prompt + handle `attachments` field in input

