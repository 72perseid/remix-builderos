

## Redesign Artifact Pages as Split-Screen (Chat Left, Content Right)

### Overview
When a user clicks on Business Model, Validation Strategy, or Product Brief from the Artifacts grid, the page opens in a **full-screen split-screen layout** -- chatbot on the left, artifact content on the right. The Artifacts grid page itself stays unchanged.

### Layout

```text
+--------------------------------------------------+
| <- Back                                          |
+-------------------+------------------------------+
|                   |                              |
|   CHATBOT         |  Business Model Canvas       |
|   (left panel)    |                              |
|   Dark background |  [Cards / content here]      |
|                   |                              |
|   AI messages     |                              |
|   User messages   |                              |
|                   |                              |
|  [Type here... >] |                              |
+-------------------+------------------------------+
```

### Changes

#### 1. Add CopilotPanel component (`src/components/artifacts/ArtifactCopilot.tsx`)
- Export a new `CopilotPanel` component that renders the chat as a **static side panel** (not an overlay)
- Same chat functionality as the existing overlay: message list, input, send button
- Styled with dark background (`bg-slate-950`), right border, fixed width (~380px)
- Uses the same `useCopilotChat` hook
- The existing `ArtifactCopilot` overlay and `CopilotToggleButton` remain available for other pages (Database Design, Kanban, Master Prompt)

#### 2. Redesign BusinessModelPage (`src/pages/BusinessModelPage.tsx`)
- Replace single-column layout with a **two-column flex layout**
- Back button spans full width at the top
- Left column: `CopilotPanel` with `context="business_model"` -- always visible
- Right column: Scrollable area with the existing business model cards and content
- Remove the `CopilotToggleButton` and `ArtifactCopilot` overlay from this page

#### 3. Redesign ValidationPage (`src/pages/ValidationPage.tsx`)
- Same split-screen pattern
- Left: `CopilotPanel` with `context="validation"`, heading "User Researcher"
- Right: Scrollable persona cards
- Remove toggle button and overlay

#### 4. Redesign ProductBriefPage (`src/pages/ProductBriefPage.tsx`)
- Same split-screen pattern
- Left: `CopilotPanel` with `context="product_brief"`, heading "Product Strategist"
- Right: Scrollable product brief content
- Remove toggle button and overlay

### What stays the same
- Artifacts grid page -- no changes, cards still navigate to the artifact routes
- Database Design, Master Prompt, AI Kanban pages -- keep their current overlay-based copilot
- All data fetching hooks (`useArtifact`, `useBusinessModel`, etc.)
- All artifact content rendering (cards, grids, lists)
- The `useCopilotChat` hook

