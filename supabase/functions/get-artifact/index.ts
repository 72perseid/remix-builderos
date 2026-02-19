import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { app_idea_id, artifact_type, user_id } = body;

    if (!app_idea_id || !artifact_type || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: app_idea_id, artifact_type, user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use service role to bypass RLS — this is a server-to-server webhook call from n8n
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase
      .from('artifacts')
      .select(`
        id,
        type,
        content,
        status,
        version,
        created_at,
        app_idea_id,
        app_ideas (
          id,
          app_name,
          app_description,
          one_liner,
          app_type,
          app_category,
          persona_description,
          user_demography,
          idea_generation,
          user_id
        )
      `)
      .eq('app_idea_id', app_idea_id)
      .eq('type', artifact_type)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error('Query error:', error);
      return new Response(
        JSON.stringify({ error: 'Artifact not found', details: error.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Artifact found: ${artifact_type} for app ${app_idea_id}`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
