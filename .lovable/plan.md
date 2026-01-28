
# Fix Skip Button on Onboarding Page

## Problem

The Skip button appears to do nothing because:
1. No visual loading feedback when clicked
2. No error handling if the database update fails
3. Button remains clickable during the async operation

## Solution

### File: `src/pages/OnboardingPage.tsx`

**Change 1: Add a loading state for skip action**

Add a new state variable after line 36:
```typescript
const [isSkipping, setIsSkipping] = useState(false);
```

**Change 2: Rewrite handleSkip with proper loading state and error handling**

Replace the current `handleSkip` function (lines 161-169) with:
```typescript
const handleSkip = async () => {
  if (isSkipping) return; // Prevent double-clicks
  
  setIsSkipping(true);
  
  try {
    // Mark as onboarded even if skipping (only if not in new app mode)
    if (user?.id && !isNewAppMode) {
      const { error } = await supabase.from('profiles').update({
        onboarded: true
      }).eq('id', user.id);
      
      if (error) {
        console.error('Failed to update profile:', error);
        // Still navigate even if update fails - don't leave user stuck
      }
    }
    
    navigate('/dashboard', { replace: true });
  } catch (err) {
    console.error('Skip failed:', err);
    // Navigate anyway to prevent user from being stuck
    navigate('/dashboard', { replace: true });
  } finally {
    setIsSkipping(false);
  }
};
```

**Change 3: Update the Skip button with loading state**

Update the Button component (lines 187-189) to show loading and be disabled during skip:
```typescript
<Button 
  variant="ghost" 
  onClick={handleSkip} 
  disabled={isSkipping}
  className="text-muted-foreground hover:text-foreground"
>
  {isSkipping ? (
    <Loader2 className="w-4 h-4 animate-spin mr-2" />
  ) : null}
  {isNewAppMode ? 'Cancel' : 'Skip'}
</Button>
```

---

## Changes Summary

| Location | Change |
|----------|--------|
| Line 36 | Add `isSkipping` state |
| Lines 161-169 | Rewrite `handleSkip` with loading state, error handling, and `{ replace: true }` |
| Lines 187-189 | Update Button with `disabled={isSkipping}` and loading spinner |

---

## Result

- Button shows spinner when clicked
- Button is disabled during the operation (prevents double-clicks)
- Database update errors are logged but don't block navigation
- User always gets redirected to dashboard (no stuck states)
- Navigation uses `replace: true` for clean browser history
