-- Allow authenticated users to read lesson_access_groups so the client can filter lessons by access tier.
-- Mirrors the pattern used by lessons / modules / ctas.
CREATE POLICY "authenticated users view lesson access groups"
  ON public.lesson_access_groups
  FOR SELECT
  TO authenticated
  USING (true);

-- Admin management policy for completeness (matches sibling tables).
CREATE POLICY "admins manage lesson access groups"
  ON public.lesson_access_groups
  FOR ALL
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));