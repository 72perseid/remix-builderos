CREATE OR REPLACE FUNCTION public.check_completion_and_trigger()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  was_full INTEGER := CASE WHEN COALESCE(OLD.bm_completion,0)=100 AND COALESCE(OLD.pb_completion,0)=100 AND COALESCE(OLD.uv_completion,0)=100 THEN 1 ELSE 0 END;
  is_full  INTEGER := CASE WHEN COALESCE(NEW.bm_completion,0)=100 AND COALESCE(NEW.pb_completion,0)=100 AND COALESCE(NEW.uv_completion,0)=100 THEN 1 ELSE 0 END;
  artifacts jsonb := '[]'::jsonb;
  payload   jsonb := '{}'::jsonb;
BEGIN
  RAISE LOG 'check_completion_and_trigger: id=% old(%,%,%) new(%,%,%)', NEW.id,
    OLD.bm_completion, OLD.pb_completion, OLD.uv_completion,
    NEW.bm_completion, NEW.pb_completion, NEW.uv_completion;

  IF is_full = 1 AND was_full = 0 THEN
    UPDATE public.artifacts
      SET status = 'completed'
    WHERE app_idea_id = NEW.id
      AND COALESCE(status, '') <> 'completed';

    SELECT COALESCE(jsonb_agg(to_jsonb(v) ORDER BY v.artifact_created_at), '[]'::jsonb)
      INTO artifacts
    FROM public.app_idea_artifacts v
    WHERE v.app_idea_id = NEW.id;

    payload := jsonb_build_object(
      'app_idea_id', NEW.id,
      'app_idea', to_jsonb(NEW),
      'artifacts', artifacts
    );

    BEGIN
      PERFORM net.http_post(
        url := 'https://amblabsdevaccount.app.n8n.cloud/webhook/generate-artifacts',
        headers := '{"content-type":"application/json"}'::jsonb,
        body := payload
      );
      RAISE LOG 'check_completion_and_trigger: http_post sent for id=%', NEW.id;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'check_completion_and_trigger: http_post failed for id=% error=%', NEW.id, SQLERRM;
    END;
  END IF;

  RETURN NEW;
END;$function$