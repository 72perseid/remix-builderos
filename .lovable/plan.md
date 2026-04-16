

## Plan: Enrollment-Based Access Control for Sidebar & Routes

### What we're building

A hook that fetches the logged-in user's enrollment record and uses `build_access`, `calendar_access`, and `programs_access` booleans to:
1. Show/hide sidebar nav items (Build, Calendar, Programs)
2. Guard routes — redirect unauthorized users
3. Create a blank Programs page

### Files to create/modify

**1. Create `src/hooks/useEnrollment.ts`**
- Query the `enrollments` table filtered by `user_id = auth.uid()` and `status = 'active'`
- Return `{ buildAccess, calendarAccess, programsAccess, loading }`
- Uses React Query for caching

**2. Create `src/pages/ProgramsPage.tsx`**
- Blank placeholder page with a "Programs" heading and "Coming soon" message
- Styled consistently with the dark theme

**3. Modify `src/components/dashboard/DashboardSidebar.tsx`**
- Import and call `useEnrollment()`
- Add a `Programs` nav item (icon: `BookOpen`, url: `/programs`, routes: `['/programs']`)
- Filter `mainNavItems` based on enrollment access:
  - Build → `buildAccess`
  - Calendar → `calendarAccess`
  - Programs → `programsAccess`
- Expert Support and 1-on-1 Coaching remain always visible (not gated)

**4. Modify `src/App.tsx`**
- Add `/programs` route wrapped in `ProtectedRoute` + `DashboardLayout`

**5. Modify `src/layouts/DashboardLayout.tsx`**
- Add `/programs` to the `hideTopNav` check (same treatment as coaching/calendar)

**6. Modify `src/components/ProtectedRoute.tsx`**
- Import `useEnrollment()`
- For `/project-board`, `/artifacts`, and all Build sub-routes: redirect to `/programs` (or first accessible route) if `buildAccess` is false
- For `/calendar`: redirect if `calendarAccess` is false
- For `/programs`: redirect if `programsAccess` is false
- Redirect target: first accessible route, or show an "Access Denied" state

### Access mapping

```text
Sidebar Item     │ Enrollment Boolean  │ Routes Gated
─────────────────┼─────────────────────┼──────────────────────────
Build            │ build_access        │ /project-board, /artifacts, /app-idea, /business-model, etc.
Calendar         │ calendar_access     │ /calendar
Programs         │ programs_access     │ /programs
Expert Support   │ always visible      │ /coaching
1-on-1 Coaching  │ always visible      │ /1on1-coaching
```

### No database changes needed
The `enrollments` table and `enforce_enrollment_access` trigger already handle the booleans. RLS already allows users to SELECT their own enrollments.

