

## Plan: Fix Tab Navigation Scrolling and Improve Scrollbar Styling

### Problem
The DashboardHeader and DashboardTabs scroll away with page content because they're inside the `overflow-y-auto` container. The scrollbar also doesn't match the dark theme.

### Changes

**1. `src/layouts/DashboardLayout.tsx` — Make header/tabs fixed, content scrollable below**

Restructure so header and tabs are outside the scrollable area:

```tsx
<main className="flex-1 flex flex-col bg-[#0f1219] overflow-hidden">
  {!hideTopNav && (
    <div className="flex-shrink-0">
      <DashboardHeader />
      <DashboardTabs />
    </div>
  )}
  <div className="overflow-y-auto flex-1">
    {children}
  </div>
</main>
```

**2. `src/index.css` — Add custom scrollbar styles**

Add themed scrollbar CSS matching the dark navy palette:
- Thin scrollbar track in `#0f1219` (matches background)
- Thumb in `#2a3344` with hover state `#3b4a5c`
- Uses both `::-webkit-scrollbar` and `scrollbar-color` for cross-browser support

