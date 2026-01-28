

# Fix Tag Popover Visibility with Portal Mode

## Problem Identified
The Kanban board uses `framer-motion` for card animations, which creates a strict stacking context that traps the Popover content. Even with high z-index values, the popover cannot escape this container because stacking contexts isolate their children from the rest of the document.

## Solution
Configure the Radix UI Popover component to use modal mode, which forces it to render in a Portal at the document `<body>` level, completely escaping the framer-motion stacking context.

## Implementation

### File: `src/components/kanban/TaskDialog.tsx`

**Change 1**: Edit Tag Popover (lines 265-274 and 290)

Add `modal={true}` to the Popover root and update PopoverContent:

```tsx
// Line 265-274: Add modal={true}
<Popover 
  modal={true}
  open={editingTagId === tag.id} 
  onOpenChange={(open) => {
    if (open) {
      handleOpenEditTag(tag);
    } else {
      setEditingTagId(null);
    }
  }}
>

// Line 290: Add z-[9999] and onOpenAutoFocus handler
<PopoverContent 
  className="w-64 p-3 bg-[#1a2744] border-slate-600 z-[9999]" 
  align="start"
  onOpenAutoFocus={(e) => e.preventDefault()}
>
```

**Change 2**: Add Tag Popover (line 377 and 389)

```tsx
// Line 377: Add modal={true}
<Popover modal={true} open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>

// Line 389: Add z-[9999] and onOpenAutoFocus handler
<PopoverContent 
  className="w-56 p-2 bg-[#1a2744] border-slate-600 z-[9999]" 
  align="start"
  onOpenAutoFocus={(e) => e.preventDefault()}
>
```

## Summary of Changes

| Location | Property | Purpose |
|----------|----------|---------|
| Line 265 (Edit Tag Popover) | `modal={true}` | Renders popover in Portal at document body, escaping framer-motion |
| Line 290 (Edit Tag PopoverContent) | `z-[9999]` | Ensures popover sits above Dialog (increased from z-[100]) |
| Line 290 (Edit Tag PopoverContent) | `onOpenAutoFocus={(e) => e.preventDefault()}` | Prevents focus conflicts with Dialog |
| Line 377 (Add Tag Popover) | `modal={true}` | Same portal behavior for consistency |
| Line 389 (Add Tag PopoverContent) | `z-[9999]` | Same z-index for consistency |
| Line 389 (Add Tag PopoverContent) | `onOpenAutoFocus={(e) => e.preventDefault()}` | Same focus prevention |

## Why This Works

1. **`modal={true}`**: Tells Radix UI to render the PopoverContent in a React Portal attached to the document `<body>`, completely bypassing any parent stacking contexts created by framer-motion

2. **`z-[9999]`**: Ensures the popover appears above the Dialog overlay (which uses z-50)

3. **`onOpenAutoFocus={(e) => e.preventDefault()}`**: Prevents the Popover from stealing focus from the Dialog, avoiding keyboard navigation conflicts

