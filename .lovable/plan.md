

## Plan: Restrict Debug Mode to Admin Users

Currently, debug mode (`?debug=true`, `Ctrl+Shift+D`, or `sessionStorage.debug_mode`) bypasses onboarding and route gating in `ProtectedRoute.tsx` for any user. This must be gated to admins only by checking the `user_roles` table for `role = 'admin'` via the existing `has_role` security definer function.

### Behavior

- **Admin user**: Debug mode toggle works, `?debug=true` activates bypass, `Ctrl+Shift+D` opens the debug nav, and onboarding/route gates are bypassable as today.
- **Non-admin user**: Toggle is a no-op, `?debug=true` is ignored, `Ctrl+Shift+D` does nothing, and `sessionStorage.debug_mode` is forcibly cleared. `ProtectedRoute` ignores any debug bypass attempt.
- **Unauthenticated**: Same as non-admin — debug stays off.

### Files

| File | Action |
|---|---|
| `src/hooks/useIsAdmin.ts` | **Create** — React Query hook that calls `supabase.rpc('has_role', { _user_id, _role: 'admin' })` for the current user. Returns `{ isAdmin, loading }`. |
| `src/hooks/useDebugMode.ts` | **Edit** — gate `setIsDebug(true)`, the URL param check, the keyboard shortcut, and `sessionStorage` writes behind `isAdmin`. If a non-admin has stale `sessionStorage.debug_mode`, clear it on mount. |
| `src/components/ProtectedRoute.tsx` | **Edit** — recompute `isDebugMode` only when `isAdmin` is true; otherwise treat as `false`. Use the same `useIsAdmin` hook. |
| `src/components/debug/DebugNav.tsx` | **Edit** — additionally guard rendering on `isAdmin` (defense in depth; `useDebugMode` already won't return `isDebug: true` for non-admins, but explicit is safer). |

### Implementation notes

- **Admin check**: Call `supabase.rpc('has_role', { _user_id: user.id, _role: 'admin' })`. The function is `SECURITY DEFINER` and reads `user_roles`, so RLS won't block it. Cache via React Query keyed on `['is-admin', user.id]` with `staleTime: 5 min`.
- **`useDebugMode` signature stays the same** (`{ isDebug, toggle }`) so callers don't change. Internally:
  - Initial state resolves to `false` until `isAdmin` resolves true; then it re-reads URL/sessionStorage.
  - `toggle()` is a no-op when `!isAdmin`.
  - On mount, if `!isAdmin && !loading`, remove `sessionStorage.debug_mode` to evict stale flags from a previously-admin session.
- **`ProtectedRoute`**: replace the existing line  
  `const isDebugMode = searchParams.get('debug') === 'true' || sessionStorage.getItem('debug_mode') === 'true';`  
  with `const { isAdmin } = useIsAdmin(); const isDebugMode = isAdmin && (searchParams.get('debug') === 'true' || sessionStorage.getItem('debug_mode') === 'true');`
- **No DB changes**: `user_roles`, the `app_role` enum, and `has_role()` already exist. No migrations needed.
- **No security finding update needed**: this hardens an internal bypass, not a flagged scanner item.

### Memory update

Update `mem://tools/debug-mode` to record that debug mode is admin-only, gated via `user_roles.role = 'admin'` through the `has_role` RPC.

