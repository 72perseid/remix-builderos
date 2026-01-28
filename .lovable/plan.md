

# Fix Skip Button with Fail-Safe Navigation

## Problem

The current `handleSkip` function has navigation calls in both `try` and `catch` blocks, but if an unexpected error occurs or the function gets stuck during the Supabase call, the user may never get redirected. Moving navigation to `finally` guarantees it always executes.

## Solution

### File: `src/pages/OnboardingPage.tsx`

**Update handleSkip function (lines 162-188)**

Move the `navigate('/dashboard', { replace: true })` call from both `try` and `catch` blocks into the `finally` block:

```typescript
const handleSkip = async () => {
  if (isSkipping) return;
  setIsSkipping(true);

  try {
    // Attempt to update 'onboarded' status
    if (user?.id && !isNewAppMode) {
      const { error } = await supabase
        .from('profiles')
        .update({ onboarded: true })
        .eq('id', user.id);

      if (error) console.error("Update failed, skipping anyway:", error);
    }
  } catch (err) {
    console.error("Skip error:", err);
  } finally {
    // CRITICAL: This MUST run to unblock the user
    navigate('/dashboard', { replace: true });
    setIsSkipping(false);
  }
};
```

---

## What Changed

| Before | After |
|--------|-------|
| `navigate()` in `try` block | Removed |
| `navigate()` in `catch` block | Removed |
| `finally` only resets `isSkipping` | `finally` now handles BOTH navigation AND state reset |

---

## Why This Works

The `finally` block in JavaScript **always executes**, regardless of:
- Success in `try` block
- Error thrown and caught in `catch` block
- Network timeouts or unexpected issues

This guarantees the user is redirected to `/dashboard` no matter what happens with the database update.

