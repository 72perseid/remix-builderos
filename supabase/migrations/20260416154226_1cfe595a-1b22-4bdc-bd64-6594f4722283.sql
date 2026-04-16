CREATE OR REPLACE FUNCTION public.enforce_enrollment_access()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
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