
# Fix ProtectedRoute to Allow `/onboarding?mode=new`

## Problem

The current `ProtectedRoute.tsx` redirects already-onboarded users away from `/onboarding` unconditionally:

```typescript
// Lines 58-61 - Current problematic logic
if (profile && profile.onboarded === true && isOnOnboardingPage) {
  return <Navigate to="/dashboard" replace />;
}
```

This blocks the "New App" flow which navigates to `/onboarding?mode=new`.

---

## Solution

Add a check for the `mode=new` query parameter and only redirect if it's NOT present.

---

## Implementation

### File: `src/components/ProtectedRoute.tsx`

**Changes:**

1. Import `useSearchParams` from `react-router-dom`
2. Parse the `mode` query parameter
3. Update the redirect condition to allow `mode=new`

```typescript
// Line 1 - Update import
import { Navigate, useLocation, useSearchParams } from 'react-router-dom';

// Line 14 - Add after useLocation()
const [searchParams] = useSearchParams();
const isNewAppMode = searchParams.get('mode') === 'new';

// Lines 58-61 - Update redirect logic
// Only redirect if user is onboarded AND on onboarding page AND NOT in new app mode
if (profile && profile.onboarded === true && isOnOnboardingPage && !isNewAppMode) {
  return <Navigate to="/dashboard" replace />;
}
```

---

## Logic Flow After Fix

```text
User navigates to /onboarding
            │
            ▼
    ┌───────────────────┐
    │ Is authenticated? │
    └───────────────────┘
            │
     No ◄───┴───► Yes
     │              │
     ▼              ▼
  Redirect    ┌────────────────────┐
  to /auth    │ profile.onboarded? │
              └────────────────────┘
                     │
          false ◄────┴────► true
            │                  │
            ▼                  ▼
         Allow           ┌───────────────┐
         access          │ mode === new? │
                         └───────────────┘
                               │
                    Yes ◄──────┴──────► No
                     │                   │
                     ▼                   ▼
                  Allow              Redirect
                  access            to /dashboard
```

---

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/ProtectedRoute.tsx` | Add `useSearchParams`, check for `mode=new` |

---

## Summary

This one-line condition change allows onboarded users to access `/onboarding` only when they explicitly request "new app" mode via the query parameter, while maintaining the original behavior of redirecting them to the dashboard if they navigate to `/onboarding` without the parameter.
