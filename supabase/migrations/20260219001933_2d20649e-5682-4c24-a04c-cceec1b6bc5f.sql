
-- Fix: explicitly set view as SECURITY INVOKER (the default safe option)
-- This ensures the view respects the querying user's RLS policies
ALTER VIEW public.app_idea_artifacts SET (security_invoker = true);
