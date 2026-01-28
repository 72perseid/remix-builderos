
# Fix Tag Edit Popover Visibility in TaskDialog

## Problem Identified
After examining the code, I found that:
1. **The Pencil icon IS present** in the `linkedTags.map` loop (line 286)
2. **The issue is z-index conflict**: Both Dialog and Popover use `z-50`, causing the popover to render behind or at the same level as the dialog overlay

When a Popover is rendered inside a Dialog, Radix UI portals both to the document body. Since they have the same z-index, the dialog overlay can obscure the popover content.

## Solution
Add a higher z-index to the PopoverContent specifically for the tag edit popover so it appears above the dialog.

## Implementation

### File: `src/components/kanban/TaskDialog.tsx`

**Change 1**: Update the edit tag PopoverContent (around line 290) to have a higher z-index:

```tsx
// Before (line 290)
<PopoverContent className="w-64 p-3 bg-[#1a2744] border-slate-600" align="start">

// After
<PopoverContent className="w-64 p-3 bg-[#1a2744] border-slate-600 z-[100]" align="start">
```

**Change 2**: Also update the "Add Tag" PopoverContent (around line 389) for consistency:

```tsx
// Before (line 389)
<PopoverContent className="w-56 p-2 bg-[#1a2744] border-slate-600" align="start">

// After
<PopoverContent className="w-56 p-2 bg-[#1a2744] border-slate-600 z-[100]" align="start">
```

## Summary of Changes

| Location | Change |
|----------|--------|
| Line 290 (Edit Tag Popover) | Add `z-[100]` class to ensure it appears above dialog |
| Line 389 (Add Tag Popover) | Add `z-[100]` class for consistency |

## Why This Works

- Dialog overlay uses `z-50` 
- Dialog content uses `z-50`
- By setting the PopoverContent to `z-[100]`, it will always render above the dialog elements
- This is the standard pattern for nested overlays in Radix UI

## Visual Confirmation

The Pencil icon is already in the code at line 286:
```tsx
<Pencil className="h-3 w-3" />
<span>{tag.label}</span>
```

The tag pills with the pencil icon should be visible. If they aren't showing, there may be no `linkedTags` data. But the z-index fix will ensure the edit popover appears correctly when clicking the tag.
