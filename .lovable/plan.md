
# Prevent Onboarding Redirect for Returning Users

## Problem

When an existing user signs in, they are being redirected to the onboarding chat if their `profile.onboarded` is `false`. This happens because:

1. The `sessionStorage.onboarding_skipped` flag clears when the browser closes
2. The `ProtectedRoute` then redirects users with `onboarded === false` back to onboarding

This creates a frustrating experience where returning users are forced through onboarding repeatedly.

## Solution

Update the `ProtectedRoute` to check if the user has any existing app ideas. If they do, they're clearly a returning user who has already used the platform, so skip the onboarding redirect.

---

## Technical Changes

### File: `src/components/ProtectedRoute.tsx`

**Add a query to check for existing app ideas:**

```tsx
// Check if user has any existing apps (indicates returning user)
const { data: hasExistingApps, isLoading: appsLoading } = useQuery({
  queryKey: ['user-has-apps', user?.id],
  queryFn: async () => {
    if (!user?.id) return false;
    const { count, error } = await supabase
      .from('app_ideas')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id);
    
    if (error) return false;
    return (count ?? 0) > 0;
  },
  enabled: !!user?.id,
});
```

**Update loading check:**
```tsx
if (loading || profileLoading || appsLoading) {
  // show loader
}
```

**Update redirect condition:**
```tsx
// If user hasn't completed onboarding, redirect to onboarding
// SKIP redirect if:
// - Already on onboarding page
// - User explicitly skipped (sessionStorage)
// - User has existing apps (returning user)
if (profile && profile.onboarded === false && !isOnOnboardingPage && !hasSkippedOnboarding && !hasExistingApps) {
  return <Navigate to="/onboarding" replace />;
}
```

---

## Summary

| Scenario | Before | After |
|----------|--------|-------|
| New user (no apps, onboarded=false) | → Onboarding | → Onboarding |
| Returning user (has apps, onboarded=false) | → Onboarding ❌ | → Dashboard ✅ |
| Returning user (onboarded=true) | → Dashboard | → Dashboard |
| User who just skipped (sessionStorage set) | → Dashboard | → Dashboard |

## Result

Returning users who have previously created apps will go directly to the dashboard, even if they skipped onboarding before. Only truly new users with no apps will be directed to onboarding.
