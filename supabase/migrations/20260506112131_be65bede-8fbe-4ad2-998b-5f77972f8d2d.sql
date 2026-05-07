CREATE OR REPLACE FUNCTION public.delete_app(_app_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = '28000';
  END IF;

  SELECT user_id INTO _owner FROM public.app_ideas WHERE id = _app_id;

  IF _owner IS NULL THEN
    RAISE EXCEPTION 'App not found' USING ERRCODE = 'P0002';
  END IF;

  IF _owner <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to delete this app' USING ERRCODE = '42501';
  END IF;

  -- Cascade in spec order: tasks -> artifacts -> chat_messages -> chat_sessions -> app_idea
  DELETE FROM public.tasks WHERE app_idea_id = _app_id;

  DELETE FROM public.artifacts WHERE app_idea_id = _app_id;

  DELETE FROM public.chat_messages
    WHERE session_id IN (
      SELECT id FROM public.chat_sessions WHERE app_idea_id = _app_id
    );

  DELETE FROM public.chat_sessions WHERE app_idea_id = _app_id;

  DELETE FROM public.app_ideas WHERE id = _app_id;
END;
$$;

REVOKE ALL ON FUNCTION public.delete_app(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.delete_app(uuid) TO authenticated;