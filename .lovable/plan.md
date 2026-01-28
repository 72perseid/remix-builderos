

# Update ArtifactsGrid to Filter Cards by Artifact Type

## Current Architecture Analysis

The `ArtifactsGrid.tsx` already implements a hybrid approach:

1. **Static card configuration** (`artifactCards` array) defines:
   - Card metadata: `title`, `description`, `route`
   - Category grouping: `planning`, `building`, `launching`
   - Database type mapping: `type` (e.g., `business_model`, `validation`)

2. **Dynamic status resolution** via `useArtifacts()`:
   - Fetches artifacts from Supabase by `type` and `status`
   - `getCardStatus()` matches config types against fetched data

This design is intentional - it ensures all 4 artifact cards are always visible (locked/available/completed states), even if no data exists yet.

## Proposed Refinement

The current implementation already groups by category which maps to type. To make the grouping logic more explicit and type-driven, I'll refactor to:

1. **Create a type-to-category mapping** that explicitly defines which artifact types belong to which section
2. **Filter the static cards using this mapping** for clarity

### Type Mapping

| Artifact Type | Section |
|---------------|---------|
| `business_model` | Feature Planning |
| `validation` | Feature Planning |
| `product_brief` | Feature Planning |
| `db_design` | Building |
| `kanban` | (Removed - redundant with Project Board) |

---

## Implementation

### File: `src/components/dashboard/ArtifactsGrid.tsx`

**Changes:**

1. Add explicit type-to-section mapping constant
2. Refactor filtering logic to use the mapping
3. Keep static card definitions for UI metadata

```typescript
// Type-to-section mapping
const TYPE_SECTION_MAP: Record<ArtifactType, 'planning' | 'building' | 'launching'> = {
  business_model: 'planning',
  validation: 'planning',
  product_brief: 'planning',
  db_design: 'building',
  kanban: 'building', // Not displayed but included for completeness
};

// Filter cards by section using the type mapping
const planningCards = artifactCards.filter(
  card => TYPE_SECTION_MAP[card.type] === 'planning'
);
const buildingCards = artifactCards.filter(
  card => TYPE_SECTION_MAP[card.type] === 'building'
);
```

---

## Visual Structure (Unchanged)

```text
┌─────────────────────────────────────────────────────────────────────┐
│                         Architect Banner                            │
├─────────────────────┬─────────────────────┬─────────────────────────┤
│  Feature Planning   │      Building       │       Launching         │
├─────────────────────┼─────────────────────┼─────────────────────────┤
│ ┌─────────────────┐ │ ┌─────────────────┐ │ ┌───────────────────┐   │
│ │ Business Model  │ │ │ Database Design │ │ │   Coming Soon     │   │
│ │ (business_model)│ │ │   (db_design)   │ │ │   🚀 Placeholder  │   │
│ └─────────────────┘ │ └─────────────────┘ │ └───────────────────┘   │
│ ┌─────────────────┐ │                     │                         │
│ │Validation Strat.│ │                     │                         │
│ │  (validation)   │ │                     │                         │
│ └─────────────────┘ │                     │                         │
│ ┌─────────────────┐ │                     │                         │
│ │  Product Brief  │ │                     │                         │
│ │ (product_brief) │ │                     │                         │
│ └─────────────────┘ │                     │                         │
└─────────────────────┴─────────────────────┴─────────────────────────┘
```

---

## Technical Details

### Why Keep Static Card Definitions?

The static `artifactCards` array is necessary because:

1. **UI Metadata**: Title, description, and route aren't stored in the database
2. **Always-Visible Cards**: Users need to see locked cards before data exists
3. **Navigation**: Routes are defined at compile time

The Supabase data only provides `type` and `status` - not enough to render the full card UI.

### Files to Modify

| File | Changes |
|------|---------|
| `src/components/dashboard/ArtifactsGrid.tsx` | Add `TYPE_SECTION_MAP`, refactor filter logic |

---

## Summary

This is a minor refactor that makes the type-to-section mapping more explicit in the code. The visual output remains identical to the current implementation, but the logic becomes clearer and more maintainable.

