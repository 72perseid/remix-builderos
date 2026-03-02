

## Database Design Page: Visual Schema Diagram

Replace the current table-grid layout with an interactive, Supabase-style schema visualizer where each table is a draggable card showing its columns, and relationship lines connect related tables.

### What Changes

**Replace `src/pages/DatabaseDesignPage.tsx`** -- Remove the grid of BusinessCard/UITable components and replace with a canvas-style layout:

1. **Table Nodes** -- Each table rendered as a styled card (dark background, rounded corners) with:
   - Header bar with table name and icon
   - Column list showing name, type, and a key icon for primary/foreign keys
   - Styled similarly to Supabase's schema viewer (compact, monospace fonts)

2. **Relationship Lines** -- SVG lines drawn between table nodes based on the `relationships` data, with:
   - Lines connecting the relevant tables
   - Small labels or arrows indicating relationship type (1:1, 1:N, M:N)

3. **Auto-layout** -- Tables positioned in a grid arrangement automatically (no dragging needed initially), spaced evenly across the canvas

4. **Zoom/Pan Container** -- Wrap the entire schema in a scrollable container so large schemas are navigable

### New Component

**`src/components/database/SchemaVisualizer.tsx`** -- A self-contained component that:
- Accepts the `tables` and `relationships` arrays from the existing data
- Computes positions for each table node in a grid
- Renders table cards as absolutely-positioned divs
- Draws SVG relationship lines between connected tables
- Uses the existing dark theme styling

### Technical Details

- No new dependencies needed -- pure React + CSS + inline SVG for lines
- Tables laid out in a responsive grid (3-4 columns), positions calculated from index
- Relationship lines use SVG `<path>` elements with bezier curves between table edges
- Both data formats (new `columns: string[]` and legacy `fields: []`) remain supported via existing parse utilities
- The page header, empty state, and copilot panel remain unchanged

