ALTER TYPE public.activity_event_type ADD VALUE IF NOT EXISTS 'video_watched';
ALTER TYPE public.activity_entity_type ADD VALUE IF NOT EXISTS 'video';

CREATE POLICY "authenticated users view videos"
  ON public.videos FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated users view resources"
  ON public.resources FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated users view ctas"
  ON public.ctas FOR SELECT TO authenticated USING (true);