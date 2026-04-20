---
name: Debug Mode
description: Admin-only debug nav panel; bypasses onboarding and route gates. Activated via ?debug=true or Ctrl+Shift+D, gated by user_roles.role='admin' via has_role RPC.
type: feature
---

A toggleable debug navigation panel provides quick access to all application routes. It is activated via `?debug=true` URL parameter or `Ctrl+Shift+D` keyboard shortcut, and persisted in `sessionStorage` under `debug_mode`.

**Admin-only**: As of this update, debug mode is restricted to users with `role = 'admin'` in the `user_roles` table. The check is performed via the `has_role` Postgres SECURITY DEFINER function, wrapped in the `useIsAdmin()` React Query hook (cached 5 min).

- Non-admin users: toggle is a no-op, URL param ignored, keyboard shortcut disabled, and any stale `sessionStorage.debug_mode` is cleared on mount.
- `ProtectedRoute` only honors `isDebugMode` when `isAdmin === true`.
- `DebugNav` component double-guards rendering on `isAdmin`.

Files: `src/hooks/useIsAdmin.ts`, `src/hooks/useDebugMode.ts`, `src/components/ProtectedRoute.tsx`, `src/components/debug/DebugNav.tsx`.
