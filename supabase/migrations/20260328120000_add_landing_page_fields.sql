ALTER TABLE public.landing_pages
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS problem_statement text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS social_proof_text text,
  ADD COLUMN IF NOT EXISTS how_it_works jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS value_proposition text;
