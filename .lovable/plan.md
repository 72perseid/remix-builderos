

## Normalize Button Styles and Copilot Button Alignment

### Problem
1. **Copilot buttons** are placed inline next to the title text rather than right-aligned in the header row.
2. **Action buttons** ("New App", "Copy to Clipboard", Copilot toggle buttons) have inconsistent styles -- some are white, some are outline, none have a pill shape with blue background.

### Changes

#### 1. Update CopilotToggleButton style (1 file)
**File:** `src/components/artifacts/ArtifactCopilot.tsx`
- Change the `CopilotToggleButton` from `variant="outline"` with dark background to a blue pill button:
  - `className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-full"`

#### 2. Right-align Copilot buttons on every artifact page (6 files)
Change the header layout from `flex items-center gap-3` to `flex items-center justify-between` so the title sits on the left and the Copilot button sits on the right.

Pages to update:
- `src/pages/BusinessModelPage.tsx` -- wrap title in a div, move `CopilotToggleButton` outside
- `src/pages/ProductBriefPage.tsx` -- same pattern
- `src/pages/ValidationPage.tsx` -- same pattern
- `src/pages/DatabaseDesignPage.tsx` -- same pattern
- `src/pages/AIKanbanAssistantPage.tsx` -- same pattern
- `src/pages/MasterPromptPage.tsx` -- add a `CopilotToggleButton` or keep consistent header with right-aligned actions (this page currently has no copilot toggle in header; the "Copy to Clipboard" button should be styled as blue pill)

#### 3. Style "New App" button as blue pill (1 file)
**File:** `src/components/dashboard/DashboardHeader.tsx`
- Change from `bg-white text-black hover:bg-slate-200 rounded-full` to `bg-primary text-white hover:bg-primary/90 rounded-full`

#### 4. Style "Copy to Clipboard" button as blue pill (1 file)
**File:** `src/pages/MasterPromptPage.tsx`
- Change from `variant="outline"` to explicit blue pill styling: `bg-primary text-white hover:bg-primary/90 rounded-full`

### Summary of Visual Result
- All action buttons across the app will have a consistent **blue background with pill (rounded-full) shape**
- Copilot toggle buttons will be **right-aligned** with the page title on every artifact page

