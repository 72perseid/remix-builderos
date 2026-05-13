## Goal
Make `hasUse('programs')` correctly return `false` for free-tier users so the "Premium Programs" section on `/programs` blurs with the `LockedOverlay` for them. Paid users (with their own `programs_access = true` from a paid product) are unaffected.

## Root cause recap
- `handle_new_user` enrolls every signup in the `Free` product.
- The `Free` product currently has a non-zero `programs_duration_days`, so the `enforce_enrollment_access` trigger sets `programs_expires_at` far in the future and flips `programs_access = true`.
- Result: every free user passes `hasUse('programs')` → no blur, ever.

## Changes (database only — one migration)

1. **Schema-safe data update on `products`** — set the Free product's `programs_duration_days` to `0` so future signups get no programs USE:
   ```sql
   UPDATE public.products
   SET programs_duration_days = 0
   WHERE product_name = 'Free';
   ```

2. **Backfill existing Free-product enrollments** — revoke programs USE for users who only have the Free product:
   ```sql
   UPDATE public.enrollments e
   SET programs_expires_at = NULL
   FROM public.products p
   WHERE e.product_id = p.id
     AND p.product_name = 'Free';
   ```
   The existing `enforce_enrollment_access` trigger fires on UPDATE and will recompute `programs_access = false` automatically (since `programs_expires_at IS NULL`).

3. **Safety net** — re-run `enforce_enrollment_access` over every row so any drift is corrected:
   ```sql
   UPDATE public.enrollments SET updated_at = now();
   ```
   (Trigger fires on UPDATE; booleans realign with their `*_expires_at` columns.)

## What stays unchanged
- No frontend changes. `ProgramsPage.tsx`, `useUserFeatures`, `LockedOverlay`, `isPaidCourse` all stay as-is.
- Paid users with a non-Free product enrollment keep their `programs_access = true` because we only null out enrollments tied to the Free product.
- `handle_new_user` keeps the same INSERT shape; with `programs_duration_days = 0` the new user's `programs_expires_at` will be `now()` → trigger sets `programs_access = false` immediately.

## Verification after running
- Re-query: every Free-only user should show `programs_access = false`. Test-premium / paid users remain `true`.
- Open `/programs` as `test-free@builderos.test` → free course visible and clickable, "Premium Programs" section visible below with blur + "Unlock our Programs" overlay.
- Open `/programs` as `test-premium@builderos.test` or admin → both sections fully unlocked.

## Out of scope
- Changing the access-group / REACH layer.
- Modifying the `Free` product's `build_duration_days` or `calendar_duration_days` (already 0 in current behavior — those gates already work).
- Any UI copy or layout changes.
