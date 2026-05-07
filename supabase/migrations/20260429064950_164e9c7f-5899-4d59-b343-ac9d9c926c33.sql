ALTER TABLE public.cta_access_groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admins manage cta access groups"
ON public.cta_access_groups
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "authenticated users view cta access groups"
ON public.cta_access_groups
FOR SELECT
TO authenticated
USING (true);