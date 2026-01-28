

# Fix Skip Button Redirect Loop

## Root Cause

There is a **redirect loop** caused by conflicting logic:

1. `handleSkip` sets `onboarded: false` and navigates to `/dashboard`
2. `ProtectedRoute` sees `onboarded === false` and redirects back to `/onboarding`
3. This creates an infinite loop

## Solution

We need to allow users who explicitly skipped onboarding to access the dashboard, even with `onboarded: false`. There are two approaches:

### Recommended Approach: Add "skipped" tracking

Add a new flag to track that the user intentionally skipped, so we can distinguish between:
- User who has never seen onboarding (`onboarded: false`, should redirect)
- User who skipped onboarding (`onboarded: false` + `skipped: true`, should access dashboard)

### Changes Required

**File 1: `src/pages/OnboardingPage.tsx`**

Update `handleSkip` to use sessionStorage to track the skip action:

```typescript
const handleSkip = async () => {
  if (isSkipping) return;
  setIsSkipping(true);

  try {
    // Mark user as NOT onboarded when skipping
    if (user?.id && !isNewAppMode) {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarded: false })
        .eq('id', user.id);

      if (error) console.error("Update failed, skipping anyway:", error);
    }
    
    // Mark that user explicitly skipped (prevents redirect loop)
    sessionStorage.setItem('onboarding_skipped', 'true');
    
  } catch (err) {
    console.error("Skip error:", err);
  } finally {
    // CRITICAL: This MUST run to unblock the user
    navigate('/dashboard', { replace: true });
    setIsSkipping(false);
  }
};
```

**File 2: `src/components/ProtectedRoute.tsx`**

Update the redirect logic to check if user explicitly skipped:

```typescript
// If profile exists and user hasn't completed onboarding, redirect to onboarding
// Skip redirect if already on onboarding page OR if user explicitly skipped
const isOnOnboardingPage = location.pathname === '/onboarding';
const hasSkippedOnboarding = sessionStorage.getItem('onboarding_skipped') === 'true';

if (profile && profile.onboarded === false && !isOnOnboardingPage && !hasSkippedOnboarding) {
  return <Navigate to="/onboarding" replace />;
}
```

---

## Technical Details

| Component | Current Behavior | New Behavior |
|-----------|------------------|--------------|
| `handleSkip` | Sets `onboarded: false`, navigates | Also sets `sessionStorage` flag |
| `ProtectedRoute` | Blocks all `onboarded: false` users | Allows skipped users through |
| Dashboard | Never accessible for skipped users | Accessible with empty state |

---

## Why sessionStorage?

- **Session-scoped**: Clears when browser closes, so fresh sessions check onboarding again
- **No database changes**: No schema migration needed
- **Immediate effect**: Works without waiting for database round-trip
- **Simple**: No additional state management required

---

## Result

After these changes:
- Click Skip → Profile updated to `onboarded: false` → sessionStorage flag set → Navigate to `/dashboard`
- ProtectedRoute sees flag → Allows access → User sees empty dashboard
- On next login (new session) → Flag cleared → User redirected to onboarding again (if still `onboarded: false`)

