
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS workflow_mode text NOT NULL DEFAULT 'new';

ALTER TABLE app_ideas
  ADD COLUMN IF NOT EXISTS bm_completion integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS uv_completion integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pb_completion integer NOT NULL DEFAULT 0;
