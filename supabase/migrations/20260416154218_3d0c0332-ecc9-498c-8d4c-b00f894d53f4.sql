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