

## Plan: Calculate Expiry Dates on Auto-Enrollment

### What Changes

Update the `handle_new_user()` trigger function so that when it inserts into `enrollments`, it calculates expiry dates from the product's duration columns:

```sql
programs_expires_at = now() + (products.programs_duration_days * interval '1 day')
calendar_expires_at = now() + (products.calendar_duration_days * interval '1 day')
build_expires_at    = now() + (products.build_duration_days * interval '1 day')
```

### Steps

**1. Migration: Update `handle_new_user()` trigger function**

Recreate the function. The enrollment insert becomes a `SELECT`-based insert that joins `products` to read the duration values:

```sql
INSERT INTO public.enrollments (
  user_id, products_id, status, enrollment_method, created_at,
  programs_expires_at, calendar_expires_at, build_expires_at
)
SELECT
  NEW.id::text,
  p.id,
  'active',
  'auto_signup',
  now(),
  now() + (COALESCE(p.programs_duration_days, 0) * interval '1 day'),
  now() + (COALESCE(p.calendar_duration_days, 0) * interval '1 day'),
  now() + (COALESCE(p.build_duration_days, 0) * interval '1 day')
FROM public.products p
WHERE p.product_name = 'Free'
LIMIT 1;
```

This also includes the `auto_signup` enum value addition and RLS policies from the earlier approved plan.

**2. Migration: Add `auto_signup` to `enrollment_method` enum**

```sql
ALTER TYPE public.enrollment_method ADD VALUE IF NOT EXISTS 'auto_signup';
```

**3. Migration: Add RLS policies on `enrollments`**

- SELECT for authenticated users on their own rows
- ALL for admins via `has_role()`

**4. Regenerate Supabase types** to reflect new columns

### Pre-requisite

I need the current body of `handle_new_user()` to recreate it without breaking existing profile/role logic. Please paste it from Supabase Dashboard > Database > Functions, or grant DB read access so I can query it.

### Files Changed

| Area | Change |
|------|--------|
| Migration | Add `auto_signup` enum value |
| Migration | Recreate `handle_new_user()` with expiry calculation |
| Migration | RLS policies on `enrollments` |
| `types.ts` | Regenerate |

