

## Redesign ArtifactCopilot: Sidebar to Bottom Panel

### What Changes

The current copilot is a permanent sidebar on the left side of artifact pages (Database Design, Business Model, Product Brief, Validation, AI Kanban). It takes up 320px of horizontal space and is always open by default.

The new design will:
- **Remove the sidebar** entirely
- **Add a chat toggle button** next to each page's title/heading
- **Show the chat as a bottom panel** that slides up and covers the full content area when opened
- **Start collapsed** (closed) by default

### Technical Details

**1. Refactor `ArtifactCopilot` component** (`src/components/artifacts/ArtifactCopilot.tsx`)
- Change from a sidebar layout to a bottom overlay panel
- Default `isOpen` to `false` instead of `true`
- When open, render as an absolutely positioned panel that covers the parent content area, anchored to the bottom and filling the full width/height
- Keep the existing chat messages, input, and loading states
- Add a slide-up animation using framer-motion

**2. Add a `CopilotToggleButton` component** (new, inside the same file or exported separately)
- A small button (e.g., MessageSquare icon + heading text) that can be placed inline next to page titles
- Clicking it toggles the copilot open/closed
- Pass the toggle state via props or a shared ref/callback

**3. Update each artifact page** (5 files):
- `src/pages/DatabaseDesignPage.tsx`
- `src/pages/BusinessModelPage.tsx`
- `src/pages/ProductBriefPage.tsx`
- `src/pages/ValidationPage.tsx`
- `src/pages/AIKanbanAssistantPage.tsx`

For each page:
- Remove `ArtifactCopilot` from the bottom of the flex layout
- Remove the `flex` layout wrapper that split content and sidebar
- Add a `relative` wrapper around the content area so the copilot can overlay it
- Place the toggle button next to the page title (e.g., "Database Design [chat icon]")
- Place the `ArtifactCopilot` inside the relative wrapper so it overlays the content when open

**4. Layout structure (per page)**

```text
<div className="relative h-full">        <-- new relative container
  <div className="overflow-auto h-full">  <-- scrollable content
    <h1>Page Title <CopilotToggle /></h1>
    ...page content...
  </div>
  <ArtifactCopilot />                     <-- overlays from bottom when open
</div>
```

When the copilot is open, it will slide up covering the content area with a semi-transparent backdrop, showing the chat interface full-width at the bottom.
