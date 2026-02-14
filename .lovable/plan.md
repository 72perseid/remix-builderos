

# Fix Sidebar Active State Color

## Problem
The Dashboard button in the sidebar appears with a white/light background instead of blue. This happens because:
1. The `SidebarMenuButton` component has a built-in CVA style `data-[active=true]:bg-sidebar-accent` 
2. The DashboardSidebar also applies `bg-primary/20` (very transparent blue) as an inline class
3. These two styles conflict, and depending on CSS specificity order, one wins over the other unpredictably

## Solution

### File: `src/components/dashboard/DashboardSidebar.tsx`

Replace the conflicting inline active styles with proper `data-[active=true]:` prefixed classes that work with the CVA system:

- **Active state**: Change from `bg-primary/20 text-primary` to using Tailwind's `data-[active=true]:bg-[hsl(217,91%,25%)] data-[active=true]:text-blue-300` to ensure the blue background wins
- **Hover state for inactive items**: Keep `hover:text-white hover:bg-white/5`
- Remove the separate icon color conditional since the text color will cascade

This ensures the active Dashboard button gets a solid dark-blue background (matching the reference) instead of a white or transparent one.

### Technical Details

The key change in the className for `SidebarMenuButton`:
- Remove the ternary that applies `bg-primary/20 text-primary` for active state
- Instead use: `data-[active=true]:!bg-[hsl(217,91%,25%)] data-[active=true]:!text-blue-300` with the `!` important modifier to ensure it overrides the CVA defaults
- For inactive: keep `text-slate-400 hover:text-white hover:bg-white/5`

