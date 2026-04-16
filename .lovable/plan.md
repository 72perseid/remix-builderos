

## Plan: Enrollment Access Control via Database Trigger

### Problem

Currently, `build_access`, `programs_access`, and `calendar_access` booleans on the `enrollments` table are set statically at insert time. They should be **dynamically enforced** by the database based on whether the corresponding `*_expires_at` date has passed.

### Approach

Two database objects:

1. **A reusable function** `enforce_enrollment_access()` that recalculates the three booleans based on expiry dates vs `now()`.
2. **A trigger** on `enrollments` that fires `BEFORE INSERT OR UPDATE`, ensuring access booleans are always correct — no matter who writes the row (trigger, admin, future daily cron job).

Later, a daily pg_cron job can simply `UPDATE enrollments SET updated_at = now() WHERE status = 'active'` to trigger the recalculation across all rows.

### Migration SQL

```sql
-- Function: enforce access booleans from expiry dates
CREATE OR REPLACE FUNCTION public.enforce_enrollment_access()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.programs_access := CASE
    WHEN NEW.programs_expires_at IS NULL THEN false
    WHEN NEW.programs_expires_at > now() THEN true
    ELSE false
  END;

  NEW.calendar_access := CASE
    WHEN NEW.calendar_expires_at IS NULL THEN false
    WHEN NEW.calendar_expires_at > now() THEN true
    ELSE false
  END;

  NEW.build_access := CASE
    WHEN NEW.build_expires_at IS NULL THEN false
    WHEN NEW.build_expires_at > now() THEN true
    ELSE false
  END;

  RETURN NEW;
END;
$$;

-- Trigger: runs before every insert or update on enrollments
CREATE TRIGGER trg_enforce_enrollment_access
  BEFORE INSERT OR UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_enrollment_access();
```

### How it works

```text
INSERT/UPDATE enrollments
        │
        ▼
  BEFORE trigger fires
        │
        ▼
  enforce_enrollment_access()
        │
  programs_expires_at > now()? → programs_access = true/false
  calendar_expires_at > now()? → calendar_access = true/false
  build_expires_at    > now()? → build_access    = true/false
        │
        ▼
  Row saved with correct booleans
```

### What this means for `handle_new_user()`

The existing trigger already sets expiry dates from the product's duration columns. Once this new trigger is in place, `handle_new_user()` no longer needs to set the `*_access` booleans at all — they'll be computed automatically. However, we won't modify `handle_new_user()` now since the values it sets will simply be overridden by the new trigger (no conflict).

### Daily cron (future step, not in this migration)

A simple `pg_cron` job that touches all active enrollments daily will cause the trigger to re-evaluate expired access:

```sql
UPDATE public.enrollments SET updated_at = now() WHERE status = 'active';
```

### Files changed

| Area | Change |
|------|--------|
| Migration | Create `enforce_enrollment_access()` function |
| Migration | Create `BEFORE INSERT OR UPDATE` trigger on `enrollments` |

No frontend code changes needed.

