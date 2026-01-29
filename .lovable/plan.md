

# Fix Sidebar Button Color Consistency

## Problem

The Dashboard sidebar menu button color is inconsistent because the `SidebarMenuButton` component has built-in styles that use the `--sidebar-accent` CSS variable, which overrides your custom `bg-[#0b0e15]` class due to data-attribute selector specificity.

## Root Cause

In `src/index.css`, the dark mode sidebar accent color is:
```css
--sidebar-accent: 240 3.7% 15.9%;  /* This is NOT #0b0e15 */
```

The `SidebarMenuButton` component uses these built-in styles:
- `data-[active=true]:bg-sidebar-accent` for active state
- `hover:bg-sidebar-accent` for hover state

These data-attribute selectors have higher specificity than your custom `bg-[#0b0e15]` class.

## Solution

Update the `--sidebar-accent` CSS variable in dark mode to use `#0b0e15`.

The hex color `#0b0e15` converts to HSL approximately: `220 33% 6%`

---

## File Change

**File:** `src/index.css`  
**Line:** 96

| Before | After |
|--------|-------|
| `--sidebar-accent: 240 3.7% 15.9%;` | `--sidebar-accent: 220 33% 6%;` |

---

## Why This Works

By changing the CSS variable that the sidebar component uses for active/hover states, all sidebar buttons will automatically use your desired `#0b0e15` color consistently, without needing to fight CSS specificity with custom classes.

## Bonus Cleanup

After this change, the custom classes in `DashboardSidebar.tsx` can be simplified since the default component styles will now use the correct color automatically.

