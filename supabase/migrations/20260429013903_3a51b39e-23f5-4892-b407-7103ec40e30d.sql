CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  free_product_id integer;
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NULLIF(NEW.raw_user_meta_data->>'first_name', ''),
    NULLIF(NEW.raw_user_meta_data->>'last_name', '')
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');

  SELECT id INTO free_product_id FROM public.products WHERE product_name = 'Free' LIMIT 1;

  INSERT INTO public.enrollments (
    user_id, access_group_id, product_id, status, enrollment_method,
    build_access, programs_access, calendar_access,
    programs_expires_at, calendar_expires_at, build_expires_at,
    created_at, updated_at
  )
  SELECT
    NEW.id,
    '05c69af7-1b0f-481c-9214-8d54f4669e43',
    p.id,
    'active',
    'auto_signup',
    true, false, false,
    now() + (COALESCE(p.programs_duration_days, 0) * interval '1 day'),
    now() + (COALESCE(p.calendar_duration_days, 0) * interval '1 day'),
    now() + (COALESCE(p.build_duration_days, 0) * interval '1 day'),
    now(), now()
  FROM public.products p
  WHERE p.id = free_product_id;

  RETURN NEW;
END;
$function$;

-- Backfill names for existing users from auth metadata where missing
UPDATE public.profiles p
SET
  first_name = COALESCE(p.first_name, NULLIF(u.raw_user_meta_data->>'first_name', '')),
  last_name = COALESCE(p.last_name, NULLIF(u.raw_user_meta_data->>'last_name', ''))
FROM auth.users u
WHERE u.id = p.id
  AND (p.first_name IS NULL OR p.last_name IS NULL)
  AND (u.raw_user_meta_data->>'first_name' IS NOT NULL OR u.raw_user_meta_data->>'last_name' IS NOT NULL);