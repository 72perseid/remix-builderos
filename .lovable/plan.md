
# Trello-Style Kanban Board Redesign Plan

## Overview
This plan outlines the complete redesign of the Kanban Board and Task Details to match Trello's dark mode UI style. The changes will transform the current implementation into a visually consistent Trello-like experience with horizontal scrolling lists, distinct floating containers, and a two-column task modal.

---

## Visual Reference

The target design follows Trello's dark mode aesthetic:
- **Board Background**: Deep purple gradient (`#563b7e` to `#1d1449`)
- **List Containers**: Semi-transparent dark floating islands (`rgba(0,0,0,0.24)`)
- **Cards**: Clean, minimal blocks with optional cover images and colored label pills
- **Modal**: Two-column layout with content on left, actions on right

---

## Implementation Details

### 1. Board Background Redesign

**File: `src/layouts/DashboardLayout.tsx`**

Add a conditional background for the project board route:
- Apply a deep purple gradient background (`from-[#563b7e] via-[#3a2463] to-[#1d1449]`) when on `/project-board`
- Keep the existing dark background for other dashboard pages

**File: `src/pages/ProjectBoardPage.tsx`**

- Wrap the board content in a container that spans the full viewport
- Remove the current navy background styling
- Add horizontal overflow scrolling behavior

---

### 2. Column/List Styling Redesign

**File: `src/pages/ProjectBoardPage.tsx` (TaskColumn component)**

Transform columns to Trello-style floating islands:

| Property | Current | New (Trello-style) |
|----------|---------|-------------------|
| Background | `bg-[#0f1729]` | `bg-black/25 backdrop-blur-sm` |
| Width | `w-72` | `w-[272px]` |
| Border | `border-slate-700/50` | `border-white/10` |
| Corner radius | `rounded-lg` | `rounded-xl` |

**Header Changes**:
- Remove colored background header
- Simple text title aligned left
- Add "..." (ellipsis) menu icon on the right
- Display card count inline with title

**Footer Changes**:
- Replace centered "New card" button with left-aligned "+ Add a card" text button
- Ghost style button matching Trello's subtle appearance

---

### 3. Card Styling Redesign

**File: `src/pages/ProjectBoardPage.tsx` (TaskCard component)**

Redesign cards to match Trello's clean block style:

**Card Container**:
- Background: `bg-[#22272b]` (Trello dark card color)
- Border: `border border-white/5`
- Hover: Lift effect with `hover:bg-[#282e33]` and subtle shadow
- Padding: Reduced to `p-2` for compact appearance

**Labels**:
- Display as small colored pills (8px height, no text by default)
- Colors: Keep existing tag colors but show as small rectangles
- On hover, expand to show label text

**Layout Order** (top to bottom):
1. Cover image (if present) - edge-to-edge at top
2. Labels row - small colored pills
3. Title - white text, 14px
4. Description preview - muted text, truncated
5. Badges row (due date, comments, etc.)

**Remove**:
- Grip handle icon (make entire card draggable)
- Priority badges (move to labels)
- Action buttons overlay (use click to open modal instead)

---

### 4. Task Detail Modal Redesign (Critical)

**File: `src/pages/ProjectBoardPage.tsx` (Edit Card Dialog)**

Complete redesign to match Trello's card modal with two-column layout:

**Modal Container**:
- Size: `sm:max-w-3xl` (wider modal)
- Background: `bg-[#323940]` (Trello dark modal background)
- Border radius: `rounded-lg`
- No default close button styling (custom styled)

**Two-Column Layout**:

```text
+------------------------------------------+
|  [Cover Image Area - Optional]           |
+------------------------------------------+
|  [Title Input - Large]                   |
|  in list "Selected for Development"      |
+------------------------------------------+
|  LEFT COLUMN (flex-1)  |  RIGHT COLUMN   |
|                        |  (170px fixed)  |
|  ----------------      |                 |
|  Description           |  Add to card    |
|  [Text area with       |  [Members]      |
|   placeholder]         |  [Labels]       |
|                        |  [Checklist]    |
|  ----------------      |  [Dates]        |
|  Activity              |  [Cover]        |
|  [Comment input]       |                 |
|  [Activity feed]       |  Actions        |
|                        |  [Move]         |
|                        |  [Copy]         |
|                        |  [Delete]       |
+------------------------------------------+
```

**Left Column Components**:
1. **Cover Area**: Optional colored banner or image at top
2. **Title Section**: 
   - Large editable title input (20px font, bold)
   - Subtitle showing current list: "in list [List Name]"
3. **Description Section**:
   - Section header with icon: "Description"
   - Rich text area with placeholder "Add a more detailed description..."
4. **Activity Section**:
   - Section header: "Activity"
   - Comment input: Avatar + "Write a comment..." input
   - Activity feed placeholder for future use

**Right Column (Sidebar) Components**:
- Stacked gray buttons in sections:
- **"Add to card" section**:
  - Members button (icon + text, full width)
  - Labels button
  - Checklist button
  - Dates button
  - Cover button
- **"Actions" section**:
  - Move button
  - Copy button
  - Delete button (red text)

**Button Styling**:
- Background: `bg-[#a1bdd914]` (subtle gray)
- Hover: `hover:bg-[#a6c5e229]`
- Text: `text-slate-300`
- Icon: Left-aligned, 16px
- Full width within sidebar

---

### 5. Add Card Dialog Redesign

**File: `src/pages/ProjectBoardPage.tsx` (Add Card Dialog)**

Simplify to match Trello's inline card creation:
- Remove dialog approach initially
- Consider inline textarea in column footer
- For now, keep dialog but simplify:
  - Only show title textarea
  - "Add card" and "X" buttons below
  - Move other fields (tag, priority) to the edit modal

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/layouts/DashboardLayout.tsx` | Add conditional purple gradient background for project board |
| `src/pages/ProjectBoardPage.tsx` | Major redesign of TaskColumn, TaskCard, and both dialogs |
| `src/types/index.ts` | Add optional `coverImage` and `labels` array to KanbanCard interface |

---

## Technical Considerations

1. **Drag and Drop**: The @dnd-kit integration remains unchanged; only visual styling updates
2. **State Management**: Existing column/card state logic preserved
3. **Responsiveness**: Maintain horizontal scroll on smaller screens
4. **Accessibility**: Ensure sufficient color contrast in dark mode
5. **Performance**: Use `backdrop-blur-sm` sparingly to avoid performance issues

---

## Summary of Color Palette

| Element | Hex Code |
|---------|----------|
| Board Background (Gradient Start) | `#563b7e` |
| Board Background (Gradient End) | `#1d1449` |
| Column Background | `rgba(0,0,0,0.24)` |
| Card Background | `#22272b` |
| Card Hover | `#282e33` |
| Modal Background | `#323940` |
| Sidebar Button | `rgba(161,189,217,0.08)` |
| Text Primary | `#b6c2cf` |
| Text Muted | `#9fadbc` |

