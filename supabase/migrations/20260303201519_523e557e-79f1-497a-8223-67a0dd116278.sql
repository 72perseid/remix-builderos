ALTER TYPE public.artifact_type ADD VALUE IF NOT EXISTS 'ui_ux';
ALTER TABLE public.app_ideas ADD COLUMN IF NOT EXISTS ux_completion integer NOT NULL DEFAULT 0;