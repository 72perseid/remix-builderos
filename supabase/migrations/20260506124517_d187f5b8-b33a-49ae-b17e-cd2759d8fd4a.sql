CREATE POLICY "Anonymous visitors can insert leads"
ON public.leads
FOR INSERT
TO anon
WITH CHECK (user_id IS NULL);