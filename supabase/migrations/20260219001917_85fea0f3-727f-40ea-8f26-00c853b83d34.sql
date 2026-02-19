
CREATE OR REPLACE VIEW public.app_idea_artifacts AS
SELECT
  ar.id                   AS artifact_id,
  ar.type                 AS artifact_type,
  ar.content,
  ar.status,
  ar.version,
  ar.created_at           AS artifact_created_at,
  ai.id                   AS app_idea_id,
  ai.app_name,
  ai.app_description,
  ai.one_liner,
  ai.app_type,
  ai.app_category,
  ai.persona_description,
  ai.user_demography,
  ai.idea_generation,
  ai.user_id
FROM artifacts ar
JOIN app_ideas ai ON ar.app_idea_id = ai.id;
