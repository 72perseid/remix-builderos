
-- 1. Column-level revoke on internal_details (only admins can read via SECURITY DEFINER functions or direct DB access)
REVOKE SELECT (internal_details) ON public.products FROM anon, authenticated;
REVOKE SELECT (internal_details) ON public.enrollments FROM anon, authenticated;

-- 2. Admin SELECT policy on leads
DROP POLICY IF EXISTS "Admins can view all leads" ON public.leads;
CREATE POLICY "Admins can view all leads"
ON public.leads
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Drop overly permissive app-logos storage policies
DROP POLICY IF EXISTS "Allow Authenticated Uploads 6ot2f0_1" ON storage.objects;
DROP POLICY IF EXISTS "Allow Authenticated Uploads 6ot2f0_2" ON storage.objects;
DROP POLICY IF EXISTS "Allow Authenticated Uploads 6ot2f0_0" ON storage.objects;
