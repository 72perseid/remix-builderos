

## Plan: Admin Panel (`/admin`)

A protected admin-only page for managing users, roles, and enrollments. Uses existing `has_role()` RPC and `user_roles` table — fully aligned with the security model already in place.

### Route & access control

- New route `/admin` in `App.tsx`, wrapped in `ProtectedRoute`.
- `ProtectedRoute` updated: if `path === '/admin'` and `!isAdmin`, redirect to first accessible route (same fallback pattern used for build/calendar/programs).
- `useIsAdmin` already exists — reuse as-is.
- Sidebar gets an "Admin" item visible **only when `isAdmin === true`** (Shield icon, pinned at bottom of nav group).

### Database changes (RLS only — no schema changes)

Current RLS blocks admins from seeing other users' data. Add admin-scoped policies:

| Table | New policies |
|---|---|
| `profiles` | `admins view all profiles` (SELECT), `admins update all profiles` (UPDATE) |
| `enrollments` | Already has `admins manage all enrollments` (ALL) ✅ — no change needed |
| `user_roles` | `admins view all roles` (SELECT), `admins insert roles` (INSERT), `admins update roles` (UPDATE), `admins delete roles` (DELETE) — currently only self-SELECT exists, so role changes are impossible |
| `access_groups` | already has authenticated SELECT ✅ |
| `products` | already has authenticated SELECT ✅ |

All new policies use `has_role(auth.uid(), 'admin'::app_role)`.

### Page structure

```text
/admin
├── Header: "Admin Panel" + user count badge
├── Tabs: [ Users | Enrollments ]
│
├── Users tab (default)
│   ├── Search input (debounced, filters by name/email)
│   ├── Paginated table (25/page)
│   │   Columns: Avatar+Name, Email, Last seen, Role, Active enrollment, Actions
│   │   Row click → opens UserDetailSheet
│   │
│   └── UserDetailSheet (right-side Sheet)
│       ├── Profile summary (read-only: email, created_at, last_seen)
│       ├── Role section: Select (user / admin) → updates user_roles
│       ├── Current enrollment card (status, access flags, expiry dates)
│       └── Buttons: [Edit enrollment] [Create new enrollment] [Expire current]
│
└── Enrollments tab
    ├── Filters: status (active/expired/pending), access_group
    ├── Table: User, Product, Access group, Status, Expires, Method, Actions
    └── Row click → EnrollmentEditDialog
```

### Components to create

- `src/pages/AdminPage.tsx` — top-level page with tab routing
- `src/components/admin/AdminUsersTable.tsx` — searchable, paginated user list
- `src/components/admin/UserDetailSheet.tsx` — Sheet with profile, role, enrollment
- `src/components/admin/RoleSelect.tsx` — dropdown that calls upsert/delete on `user_roles`
- `src/components/admin/EnrollmentEditDialog.tsx` — form for create/edit (access_group, product, expiry dates, status)
- `src/components/admin/AdminEnrollmentsTable.tsx` — list view with filters

### Hooks to create

- `src/hooks/admin/useAdminUsers.ts` — paginated query of `profiles` left-joined client-side with `user_roles` and active `enrollments` (3 parallel queries, merged by user_id; React Query)
- `src/hooks/admin/useAdminUserDetail.ts` — single-user fetch (profile + all enrollments + role)
- `src/hooks/admin/useUpdateUserRole.ts` — mutation: delete existing rows, insert new role (user_roles is unique on user_id+role)
- `src/hooks/admin/useEnrollmentMutations.ts` — create / update / expire mutations on `enrollments`

### Behavioral notes

- **Search** uses Supabase `.or('first_name.ilike.%q%,last_name.ilike.%q%,email.ilike.%q%')` with 300ms debounce.
- **Pagination** via `.range(from, to)` + `count: 'exact'`.
- **Role change** on self is blocked client-side (admin can't demote themselves) to avoid lockout; warning toast.
- **Expire enrollment** sets `status = 'expired'`. The existing `enforce_enrollment_access` trigger already recomputes the `*_access` flags from expiry dates — we'll also null out expiry dates on expire so the trigger drives access to false on the next page load.
- **Create enrollment** requires: user_id, access_group_id, product_id, status (default 'active'), enrollment_method = 'manual', and expiry dates. The trigger derives `*_access` from dates automatically.
- All admin queries invalidate React Query keys on mutation for live UI updates.

### Out of scope (V2+)

- Bulk operations, CSV export, audit log UI for `activity_log`, course/lesson admin, coach admin, access-group/product CRUD UIs. These can be added later as new tabs.

### Files changed

| File | Change |
|---|---|
| `supabase/migrations/<new>.sql` | Add admin RLS policies on `profiles` and `user_roles` |
| `src/App.tsx` | Add `/admin` route |
| `src/components/ProtectedRoute.tsx` | Gate `/admin` by `isAdmin` |
| `src/components/dashboard/DashboardSidebar.tsx` | Conditional "Admin" nav item |
| `src/pages/AdminPage.tsx` | New |
| `src/components/admin/*` | New (5 components above) |
| `src/hooks/admin/*` | New (4 hooks above) |
| `mem://index.md` + `mem://features/admin/admin-panel.md` | Document the new feature |

