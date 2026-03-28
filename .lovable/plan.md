

# Improved PDF Export with Design-Preserving Options

## Problem
The current PDF export converts artifact JSON to plain markdown-style text, losing the card-based visual design users see on screen.

## Approach: Two PDF Export Methods

### Option 1 — "Styled PDF" (enhanced current approach)
Rebuild `generatePdfHtml` to produce HTML that mirrors the card-based layout of the artifact pages — colored section headers with icons (as emoji/unicode), rounded card containers, badges rendered as styled spans, and a branded header with app name and export date. This keeps text selectable and produces small file sizes.

### Option 2 — "Screenshot PDF" (new, using html2canvas + jsPDF)
Capture the actual rendered artifact content area as an image and embed it into a PDF. This preserves the exact on-screen design — dark theme, cards, badges, icons — pixel-perfectly. Trade-off: text is not selectable in the PDF.

## Implementation Plan

### 1. Install dependencies
- Add `html2canvas` and `jspdf` packages

### 2. Rewrite `ArtifactExportButton.tsx`
- **Three export options**: Markdown, Styled PDF, Visual PDF (screenshot)
- **Styled PDF**: Redesign `generatePdfHtml` to use card-like containers with colored left borders, section icons as unicode characters, badge-style spans for tags/metrics, a branded header bar, and proper print CSS
- **Visual PDF**: Add a new handler that uses `html2canvas` to capture a target DOM element (the artifact content area), then embeds the canvas into a jsPDF document and triggers download — no print dialog needed

### 3. Add capture target refs to artifact pages
- Each artifact page (BusinessModel, ProductBrief, Validation, UIUX) needs to expose a ref or a known DOM id (e.g., `id="artifact-content"`) on the scrollable content area so the screenshot export can target it
- Minor change: wrap the content grid in a div with `id="artifact-export-area"`

### 4. Update dropdown menu
- Three items: "Markdown (.md)", "Styled PDF", "Visual PDF (screenshot)"
- Visual PDF option shows a brief loading state while capturing

## Technical Details
- `html2canvas` renders the DOM element to a canvas at 2x scale for quality
- `jsPDF` creates an A4 document and fits the captured image proportionally
- The styled PDF uses a light theme for print readability (white background, dark text, colored accents matching each section's icon color)
- No backend or Supabase edge function needed — everything runs client-side

