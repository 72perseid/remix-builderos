CREATE POLICY "authenticated users view courses" ON public.courses FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated users view modules" ON public.modules FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated users view lessons" ON public.lessons FOR SELECT TO authenticated USING (true);
CREATE POLICY "authenticated users view programs" ON public.programs FOR SELECT TO authenticated USING (true);