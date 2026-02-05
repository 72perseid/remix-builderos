
# Fix Master Prompt Card UI on Dashboard

## Overview

Make the Master Prompt card inviting and clickable when it's ready to generate, instead of showing a locked/disabled state.

---

## Changes Required

### File 1: `src/components/dashboard/ArtifactCard.tsx`

**Add new status type and configuration:**

| Change | Details |
|--------|---------|
| Add `"ready"` to `ArtifactStatus` type | Line 6: `"loading" \| "locked" \| "completed" \| "available" \| "ready"` |
| Import `Sparkles` icon | Add to lucide-react imports |
| Add `ready` config | New entry in `statusConfig` object |

```typescript
ready: {
  icon: <Sparkles className="h-3.5 w-3.5" />,
  label: "Ready to Generate",
  color: "text-primary",  // or text-green-400
},
```

**Update clickable logic (line 62):**
```typescript
const isClickable = status === "available" || status === "completed" || status === "ready";
```

**Update styling conditions:**
- Remove opacity reduction for `ready` status
- Ensure title/description use active colors for `ready`

---

### File 2: `src/components/dashboard/ArtifactsGrid.tsx`

**Update `getCardStatus` function to handle master_prompt specially:**

```typescript
const getCardStatus = (type: ArtifactType): ArtifactStatus => {
  if (loading) return 'loading';
  const artifact = artifacts.find(a => a.type === type);

  // Special handling for master_prompt
  if (type === 'master_prompt') {
    // If artifact exists and completed, show completed
    if (artifact?.status === 'completed') return 'completed';
    if (artifact?.status === 'generating') return 'loading';
    
    // Check if all prerequisites are met
    const prerequisites = ['business_model', 'db_design', 'validation', 'product_brief'];
    const allPrerequisitesMet = prerequisites.every(
      prereq => artifacts.some(a => a.type === prereq)
    );
    
    // If prerequisites met but no master_prompt yet, show "ready"
    if (allPrerequisitesMet) return 'ready';
    
    // Otherwise locked
    return 'locked';
  }

  // Default behavior for other artifacts
  if (!artifact) return 'locked';
  if (artifact.status === 'completed') return 'completed';
  if (artifact.status === 'generating') return 'loading';
  return 'available';
};
```

---

## Visual Result

| State | Icon | Label | Clickable | Opacity |
|-------|------|-------|-----------|---------|
| Before (locked) | 🔒 Lock | "Waiting for data" | No | 60% |
| After (ready) | ✨ Sparkles | "Ready to Generate" | Yes | 100% |

---

## Files Modified

| File | Changes |
|------|---------|
| `src/components/dashboard/ArtifactCard.tsx` | Add `ready` status type, import Sparkles, update clickable logic |
| `src/components/dashboard/ArtifactsGrid.tsx` | Add prerequisite check for master_prompt in `getCardStatus` |
