

# Artifact Pages Focus Mode - Open in New Tab

## Overview

Transform artifact pages to open in a new browser tab with a "Focus Mode" layout that shows only the Copilot Chat Sidebar and the document content — without the main Dashboard Sidebar, Header, or Tabs.

---

## Current State

### App.tsx Routing (lines 50-78)
All artifact routes are wrapped in `<DashboardLayout>`:
```typescript
<Route path="/business-model" element={
  <ProtectedRoute>
    <DashboardLayout><BusinessModelPage /></DashboardLayout>  // ← Includes Sidebar
  </ProtectedRoute>
} />
```

### ArtifactsGrid.tsx (lines 101, 124)
Uses `navigate()` for same-tab navigation:
```typescript
onClick={() => navigate(card.route)}
```

---

## Solution

### Change 1: Update App.tsx Routing

Move artifact routes outside `DashboardLayout` wrapper so they render as standalone pages:

| Route | Before | After |
|-------|--------|-------|
| `/business-model` | `<DashboardLayout><BusinessModelPage /></DashboardLayout>` | `<BusinessModelPage />` |
| `/validation` | `<DashboardLayout><ValidationPage /></DashboardLayout>` | `<ValidationPage />` |
| `/product-brief` | `<DashboardLayout><ProductBriefPage /></DashboardLayout>` | `<ProductBriefPage />` |
| `/database-design` | `<DashboardLayout><DatabaseDesignPage /></DashboardLayout>` | `<DatabaseDesignPage />` |

Each remains wrapped in `<ProtectedRoute>` for authentication.

---

### Change 2: Update ArtifactsGrid.tsx Navigation

Replace `navigate()` with `window.open()`:

```typescript
// Before
onClick={() => navigate(card.route)}

// After  
onClick={() => window.open(card.route, '_blank')}
```

Also remove the unused `useNavigate` import.

---

### Change 3: Update Artifact Pages Background

Since artifact pages will no longer inherit `DashboardLayout`'s `bg-[#0B0E14]`, each page needs its own background styling. Update the wrapper div in each artifact page to include the dark background.

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/App.tsx` | Remove `<DashboardLayout>` wrapper from 4 artifact routes |
| `src/components/dashboard/ArtifactsGrid.tsx` | Change `navigate()` to `window.open()`, remove unused import |
| `src/pages/BusinessModelPage.tsx` | Add `bg-[#0B0E14] min-h-screen` to outer wrapper |
| `src/pages/ValidationPage.tsx` | Add `bg-[#0B0E14] min-h-screen` to outer wrapper |
| `src/pages/ProductBriefPage.tsx` | Add `bg-[#0B0E14] min-h-screen` to outer wrapper |
| `src/pages/DatabaseDesignPage.tsx` | Add `bg-[#0B0E14] min-h-screen` to outer wrapper |

---

## Result Layout Comparison

```text
BEFORE (with DashboardLayout):
┌─────────────────────────────────────────────────┐
│ Dashboard Header                                │
├──────────┬──────────────────────────────────────┤
│ Sidebar  │ Tabs: Artifacts | Project Board     │
│          ├──────────────────────────────────────┤
│          │ ┌────────────┬───────────────────┐  │
│          │ │ Copilot    │ Document Content  │  │
│          │ │ Sidebar    │                   │  │
│          │ └────────────┴───────────────────┘  │
└──────────┴──────────────────────────────────────┘

AFTER (Focus Mode in new tab):
┌─────────────────────────────────────────────────┐
│ ┌────────────┬──────────────────────────────┐   │
│ │ Copilot    │ Document Content             │   │
│ │ Sidebar    │ (Back to Artifacts button)   │   │
│ │            │                              │   │
│ └────────────┴──────────────────────────────┘   │
└─────────────────────────────────────────────────┘
```

---

## Technical Notes

1. **ArtifactBackButton**: Already navigates to `/dashboard` — this will close the current tab if user clicks it, taking them back. May need to update to `window.close()` or keep as-is (standard browser behavior).

2. **Context Providers**: `ProjectProvider` and `ChatProvider` are in `App.tsx` at the root level, so artifact pages will still have access to project context.

3. **ArtifactCopilot**: Already has `order-first` CSS to position on the left side — no changes needed.

