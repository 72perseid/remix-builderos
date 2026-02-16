

## Consolidate Card Design System

### What Changes

Based on the reference screenshot, the card design should use:
- A consistent dark navy background (currently hardcoded as `#161e2a` in 12+ files)
- White for primary/title text
- A blue-gray tone for secondary/description text (not pure white, not pure gray)

### Design Tokens (src/index.css)

1. **Update `--card`** variable to match the actual card background `#161e2a` (HSL ~215 28% 13%) instead of the current `240 10% 9%`. This lets us use `bg-card` everywhere instead of the hardcoded hex.

2. **Update `--secondary-foreground`** from pure white (`0 0% 100%`) to a blue-tinted gray (`215 20% 65%`, roughly `#94a0b8`). This creates the subtle blue-gray description text visible in the reference design, maintaining clear hierarchy below the white titles.

### Component Updates

3. **Replace all `bg-[#161e2a]`** with `bg-card` across ~12 files:
   - ArtifactCard, ArtifactsGrid, ArchitectBanner
   - highlight-card, business-card
   - ProjectBoardPage, AIKanbanAssistantPage
   - MasterPromptPage, DatabaseDesignPage, ValidationPage
   - kanban-board

4. **Normalize secondary text color** in card components -- replace scattered `text-muted-foreground` body text in cards with `text-secondary-foreground` so they pick up the new blue-gray token:
   - business-card.tsx (line 66)
   - ArtifactCard.tsx description
   - highlight-card.tsx description
   - RoadmapCard.tsx description
   - DynamicKanbanColumn.tsx counts/empty text

### Technical Details

Files modified: `src/index.css` plus approximately 12 component files. No new files or dependencies. All changes are class name swaps and two CSS variable value updates.

