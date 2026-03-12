

## Debug Navigation Sidebar

Add a toggleable debug navigation panel that lists all app routes, activated via a URL query parameter (`?debug=true`) or a keyboard shortcut.

### Activation
- **URL param**: Append `?debug=true` to any route to show the debug nav
- **Keyboard shortcut**: `Ctrl+Shift+D` toggles debug mode on/off (persisted in `sessionStorage`)

### Implementation

**1. Create `src/components/debug/DebugNav.tsx`**
- A fixed left-edge panel (semi-transparent dark background, ~200px wide, z-50) listing all routes as clickable links
- Routes extracted from a static list matching `App.tsx` routes: `/onboarding`, `/artifacts`, `/project-board`, `/app-idea`, `/business-model`, `/database-design`, `/validation`, `/product-brief`, `/ui-ux`, `/master-prompt`, `/app-details`, `/coaching`, `/login`
- Highlights current route
- Small "x" button to dismiss
- Only renders when debug mode is active

**2. Create `src/hooks/useDebugMode.ts`**
- Reads `?debug=true` from URL search params OR `sessionStorage` key `debug_mode`
- Listens for `Ctrl+Shift+D` keydown to toggle
- Returns `isDebug` boolean

**3. Update `src/App.tsx`**
- Import and render `<DebugNav />` inside `BrowserRouter` (always mounted, self-gating via the hook)

This keeps the debug nav completely separate from production UI and accessible from any page including onboarding.

