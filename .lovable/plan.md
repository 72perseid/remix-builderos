
# Fix Missing Project Board Route

## Problem

The `/project-board` route is missing from `App.tsx`. While `ProjectBoardPage` is imported (line 17), there is no corresponding `<Route>` definition, causing a 404 error when clicking the "Project Board" tab.

---

## Solution

Add the missing route definition for `/project-board`, wrapped in `DashboardLayout` so it includes the sidebar, header, and tabs.

---

## Implementation

### File: `src/App.tsx`

Add the following route after the `/app-idea` route (around line 49):

```typescript
<Route path="/project-board" element={
  <ProtectedRoute>
    <DashboardLayout><ProjectBoardPage /></DashboardLayout>
  </ProtectedRoute>
} />
```

---

## Route Structure After Fix

| Route | Layout | Component |
|-------|--------|-----------|
| `/dashboard` | DashboardLayout | Dashboard |
| `/app-idea` | DashboardLayout | AppIdeaPage |
| `/project-board` | DashboardLayout | ProjectBoardPage |
| `/business-model` | None (Focus Mode) | BusinessModelPage |
| `/database-design` | None (Focus Mode) | DatabaseDesignPage |
| `/validation` | None (Focus Mode) | ValidationPage |
| `/product-brief` | None (Focus Mode) | ProductBriefPage |

---

## Files to Modify

| File | Change |
|------|--------|
| `src/App.tsx` | Add route definition for `/project-board` with `DashboardLayout` wrapper |

---

## Summary

This is a one-line addition to restore the missing route. The import for `ProjectBoardPage` already exists, so we only need to add the route definition.
