-- Ensure the app-logos bucket exists
INSERT INTO storage.buckets (id, name, public)
VALUES ('app-logos', 'app-logos', true)
ON CONFLICT (id) DO NOTHING;

-- Anyone can view app logos (public bucket)
CREATE POLICY "Anyone can view app logos"
ON storage.objects FOR SELECT
USING (bucket_id = 'app-logos');

-- Authenticated users can upload logos for their own apps
CREATE POLICY "Users can upload logos for their apps"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'app-logos' AND
  EXISTS (
    SELECT 1 FROM public.app_ideas
    WHERE app_ideas.id::text = (storage.foldername(name))[2]
    AND app_ideas.user_id = auth.uid()
  )
);

-- Users can update their own app logos
CREATE POLICY "Users can update their app logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'app-logos' AND
  EXISTS (
    SELECT 1 FROM public.app_ideas
    WHERE app_ideas.id::text = (storage.foldername(name))[2]
    AND app_ideas.user_id = auth.uid()
  )
);

-- Users can delete their own app logos
CREATE POLICY "Users can delete their app logos"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'app-logos' AND
  EXISTS (
    SELECT 1 FROM public.app_ideas
    WHERE app_ideas.id::text = (storage.foldername(name))[2]
    AND app_ideas.user_id = auth.uid()
  )
);