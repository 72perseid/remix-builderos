

## Make Artifact Pages Fullscreen (No Sidebar/Header)

### Problem
The Business Model, Validation Strategy, and Product Brief pages are currently wrapped in `DashboardLayout` in `App.tsx`, which adds the sidebar and header around them. The pages themselves already have the correct split-screen layout, but the dashboard chrome prevents them from being fullscreen.

### Solution
Remove the `DashboardLayout` wrapper from these three routes in `App.tsx` so they render fullscreen -- just like the Onboarding page does.

### Changes

**File: `src/App.tsx`**
- Remove `<DashboardLayout>` wrapper from the `/business-model` route
- Remove `<DashboardLayout>` wrapper from the `/validation` route
- Remove `<DashboardLayout>` wrapper from the `/product-brief` route

The routes will change from:
```tsx
<Route path="/business-model" element={
  <ProtectedRoute>
    <DashboardLayout><BusinessModelPage /></DashboardLayout>
  </ProtectedRoute>
} />
```
To:
```tsx
<Route path="/business-model" element={
  <ProtectedRoute>
    <BusinessModelPage />
  </ProtectedRoute>
} />
```

Same pattern for `/validation` and `/product-brief`.

No other files need changes -- the pages already have their own back button, CopilotPanel, and full-height layout built in.

