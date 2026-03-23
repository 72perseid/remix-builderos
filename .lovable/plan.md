

## Activate UI/UX Design Artifact

### What exists already
- `UIUXPage.tsx` — fully built page with CopilotPanel, breadcrumb, completion polling, and content rendering (color palette, typography, spacing, components, design principles, brand tone)
- `ui_ux` enum value in `artifact_type`, `ux_completion` column in `app_ideas`
- Route `/ui-ux` registered in `App.tsx`
- CopilotPanel already has `ui_ux` suggestions and completion key mapping
- The DB trigger (`check_completion_and_trigger`) only checks bm/uv/pb — UI/UX is already excluded, so board/db-design/master-prompt generation works independently

### What needs to change

**1. Remove "Coming Soon" flag from ArtifactsGrid** (`src/components/dashboard/ArtifactsGrid.tsx`)
- Remove `comingSoon: true` from the `ui_ux` card config (line 43)
- Add `ux_completion` to the `completionMap` (currently only maps bm, uv, pb)
- The card will then render as a normal `ArtifactCard` with status/completion tracking like the other three

**2. Add completion to ArtifactsGrid completionMap** (`src/components/dashboard/ArtifactsGrid.tsx`)
- Add `ui_ux: selectedApp?.ux_completion ?? null` to the `completionMap` object

That's it. Everything else (the page, copilot integration, routing, DB schema, completion polling) is already wired up. The n8n backend just needs a `Sandro_UX` specialist tool configured separately to handle the `artifact_type: "ui_ux"` context — but the frontend will be ready.

### Flow (same as other artifacts)
1. User clicks UI/UX Design card on Artifacts grid
2. Opens `/ui-ux` with CopilotPanel (heading: "UX Designer")
3. User chats → n8n receives `artifact_type: "ui_ux"`, `workflowMode: "chat"`
4. n8n updates `ux_completion` in `app_ideas` and writes to `artifacts` table
5. Page polls completion every 10s, shows progress bar, triggers 100% popup
6. Content renders as design system cards (colors, typography, spacing, etc.)
7. Board/DB design/Master Prompt generation remains independent — only requires bm+uv+pb at 100%

### Files changed
| File | Change |
|------|--------|
| `src/components/dashboard/ArtifactsGrid.tsx` | Remove `comingSoon: true`, add `ui_ux` to `completionMap` |

~2 lines changed total.

