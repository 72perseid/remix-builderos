

# Fix Edit Card Modal UI - Deadline Picker & Acceptance Criteria

## Overview
This plan addresses three UI refinements in the Edit Card modal to achieve a clean, minimal Trello-like experience:
1. Fix the Deadline Picker positioning (anchored popover instead of floating overlay)
2. Refine Acceptance Criteria styling to be minimal
3. Remove any extraneous toolbar elements

---

## 1. Fix Deadline Picker (Critical)

### Problem
The current implementation wraps a `<div>` around `SidebarButton` as the PopoverTrigger, which may cause positioning issues. The calendar appears to float to the top-left instead of anchoring next to the button.

### Solution
- Modify the `SidebarButton` component to accept `forwardRef` so it can be used directly with `asChild`
- Update the PopoverTrigger to properly wrap the SidebarButton without an intermediate `<div>`
- Ensure the PopoverContent has proper `side` and `align` props for correct positioning
- Add explicit `z-50` and proper styling to keep it anchored to the sidebar

### Code Changes

**Update SidebarButton to support ref forwarding:**
```tsx
const SidebarButton = React.forwardRef<HTMLButtonElement, SidebarButtonProps>(
  ({ icon, label, onClick, variant = 'default', active, ...props }, ref) => {
    return (
      <button
        ref={ref}
        onClick={onClick}
        className={cn(/* existing styles */)}
        {...props}
      >
        {icon}
        {label}
      </button>
    );
  }
);
SidebarButton.displayName = 'SidebarButton';
```

**Update Deadline Popover structure:**
```tsx
<Popover open={isDeadlineOpen} onOpenChange={setIsDeadlineOpen}>
  <PopoverTrigger asChild>
    <SidebarButton 
      icon={<Calendar className="w-4 h-4" />} 
      label={editingCard.plannedDate 
        ? format(new Date(editingCard.plannedDate), 'MMM d')
        : "Deadline"
      }
      active={!!editingCard.plannedDate}
    />
  </PopoverTrigger>
  <PopoverContent 
    className="w-auto p-0 bg-[#1a2332] border-slate-700 z-[100]" 
    side="left" 
    align="start"
    sideOffset={8}
  >
    <CalendarComponent ... />
  </PopoverContent>
</Popover>
```

---

## 2. Refine Acceptance Criteria Styling

### Current Issues
- Header is too large
- Progress bar is too thick (8px → should be 4px)
- Items have excessive padding
- Add button is too prominent

### Solution

**Header with percentage:**
```tsx
<div className="flex items-center justify-between mb-1">
  <div className="flex items-center gap-2">
    <CheckSquare className="w-4 h-4 text-slate-400" />
    <span className="text-sm text-slate-300">Acceptance Criteria</span>
  </div>
  <span className="text-xs text-slate-500">{Math.round(progressPercent)}%</span>
</div>
```

**Thin progress bar (4px height):**
```tsx
<div className="h-1 bg-slate-700/50 rounded-full overflow-hidden mb-3">
  <div 
    className={cn(
      "h-full transition-all duration-300",
      completedCount === totalCount ? "bg-green-500" : "bg-primary"
    )}
    style={{ width: `${progressPercent}%` }}
  />
</div>
```

**Minimal item styling:**
```tsx
<div className="space-y-1">
  {checklist.map(item => (
    <div 
      key={item.id} 
      className="flex items-center gap-2 group py-1 px-1 rounded hover:bg-slate-800/50 -mx-1"
    >
      <Checkbox 
        checked={item.done}
        onCheckedChange={() => handleToggleCriteria(item.id)}
        className="h-4 w-4 border-slate-600 data-[state=checked]:bg-primary"
      />
      <span className={cn(
        "flex-1 text-sm",
        item.done ? "text-slate-500 line-through" : "text-slate-300"
      )}>
        {item.text}
      </span>
      <button
        onClick={() => handleDeleteCriteria(item.id)}
        className="opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 transition-opacity"
      >
        <Trash2 className="w-3 h-3 text-slate-500" />
      </button>
    </div>
  ))}
</div>
```

**Subtle "+ Add an item" button:**
```tsx
<button
  onClick={() => { /* focus input */ }}
  className="text-sm text-slate-400 hover:text-slate-300 hover:underline mt-2"
>
  + Add an item
</button>
```
Or inline input that shows on click.

---

## 3. Cleanup - Remove Toolbar

Based on the session context, there may be extraneous "+" and "Deadline" buttons appearing at the top of the content area. Looking at the current code, I don't see such a toolbar in the main structure, but I'll ensure:

- All action buttons strictly remain in the Right Sidebar
- No duplicate controls in the left content area
- The left column only contains: Title, Description, Acceptance Criteria section, and Activity

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/pages/ProjectBoardPage.tsx` | Refactor SidebarButton with forwardRef, fix Popover structure, update Acceptance Criteria styling |

---

## Visual Before/After

### Acceptance Criteria - Before
```text
+----------------------------------------+
| [CheckSquare] Acceptance Criteria  [2/5 passed] |
|                                        |
| [===========================]  (8px bar)|
|                                        |
| [ ] Item with large padding            |
| [ ] Another item with borders          |
|                                        |
| [        Add        ] (Primary button) |
+----------------------------------------+
```

### Acceptance Criteria - After
```text
+----------------------------------------+
| Acceptance Criteria              67%   |
| [========================]  (4px bar)  |
| ☑ Item one                        🗑   |
| ☐ Item two                        (hidden) |
| + Add an item                          |
+----------------------------------------+
```

---

## Technical Details

1. **forwardRef for SidebarButton**: Required so Radix UI's `asChild` prop can properly attach the PopoverTrigger behavior to the button element
2. **PopoverContent positioning**: Using `side="left"` and `align="start"` will position the calendar to the left of the sidebar button, or use `side="bottom"` to appear below
3. **z-index**: Add `z-[100]` to ensure popover appears above the modal content
4. **Progress bar**: Change from `h-2` to `h-1` (4px)
5. **Icon swap**: Use `Trash2` icon instead of `X` for delete action to match Trello style

