

# Fix Edit Tag Discoverability in TaskDialog

## Problem
The "Edit Tag" feature exists but is not discoverable. Users cannot tell that clicking on a tag pill opens an edit popover because:
1. No visual indicator (pencil icon) shows it's editable
2. The cursor doesn't clearly indicate clickability
3. The popover trigger encompasses the X button, causing confusion

## Solution

Update the tag pill structure in `TaskDialog.tsx` to improve discoverability and interaction:

### UI Changes

**Before (Current Structure):**
```
[Tag Label X]  <- entire thing is popover trigger, X inside
```

**After (Improved Structure):**
```
[✏ Tag Label] [X]  <- pill with pencil is popover trigger, X is separate
```

### Implementation Details

**File: `src/components/kanban/TaskDialog.tsx`**

1. **Add Pencil Icon Import**: Import the `Pencil` icon from lucide-react

2. **Restructure Tag Pill Layout**: 
   - Wrap just the editable portion (pencil + label) in `PopoverTrigger`
   - Keep the X (unlink) button completely outside the trigger
   - Use a flex container to group both elements visually as one pill

3. **Visual Cues**:
   - Add `Pencil` icon (h-3 w-3) inside the tag pill, before the label text
   - Add `cursor-pointer` to the editable portion
   - Add `hover:opacity-80` transition for visual feedback

4. **Separation**:
   - The X button remains separate with `stopPropagation` already in place
   - Add a subtle visual separator (slight gap or divider) between label and X

### Code Changes (Lines 263-295)

Replace the current linked tags mapping with:

```tsx
{linkedTags.map(tag => (
  <div key={tag.id} className="inline-flex items-center">
    <Popover 
      open={editingTagId === tag.id} 
      onOpenChange={(open) => {
        if (open) {
          handleOpenEditTag(tag);
        } else {
          setEditingTagId(null);
        }
      }}
    >
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-l font-medium cursor-pointer hover:opacity-80 transition-opacity"
          style={{
            backgroundColor: `${tag.color}20`,
            color: tag.color,
            border: `1px solid ${tag.color}40`,
            borderRight: 'none'
          }}
        >
          <Pencil className="h-3 w-3" />
          <span>{tag.label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-3 bg-[#1a2744] border-slate-600" align="start">
        {/* ... existing edit popover content ... */}
      </PopoverContent>
    </Popover>
    
    {/* Separate Unlink Button */}
    <button
      type="button"
      onClick={() => handleUnlinkTag(tag.id)}
      className="inline-flex items-center px-1.5 py-1 rounded-r text-xs hover:opacity-70 transition-opacity"
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        border: `1px solid ${tag.color}40`,
        borderLeft: 'none'
      }}
    >
      <X className="h-3 w-3" />
    </button>
  </div>
))}
```

### Visual Result

```
+--------------------+
| Tags               |
+--------------------+
| [✏ MVP][×] [✏ Backend][×]  [+ Add Tag] |
+--------------------+
   ^^^^^^^            ^^^
   Clickable for      Separate unlink
   edit popover       button
```

### Summary of Changes

| Change | Description |
|--------|-------------|
| Add Pencil icon | Import and display `Pencil` from lucide-react inside each tag pill |
| Restructure trigger | Only wrap the editable content (pencil + label) in PopoverTrigger |
| Separate X button | Move X button completely outside the Popover component |
| Add cursor styles | Ensure `cursor-pointer` on the editable portion |
| Visual grouping | Use `rounded-l` and `rounded-r` to make both parts look like one pill |

