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
    // Authenticate: require shared secret for server-to-server calls
    const internalSecret = req.headers.get('x-internal-secret');
    const expectedSecret = Deno.env.get('INTERNAL_WEBHOOK_SECRET');

    if (!expectedSecret || internalSecret !== expectedSecret) {
      // Fallback: try JWT auth for authenticated user calls
      const authHeader = req.headers.get('Authorization');
      if (!authHeader?.startsWith('Bearer ')) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      const authClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_ANON_KEY')!,
        { global: { headers: { Authorization: authHeader } } }
      );

      const token = authHeader.replace('Bearer ', '');
      const { data: claimsData, error: claimsError } = await authClient.auth.getClaims(token);
      if (claimsError || !claimsData?.claims) {
        return new Response(
          JSON.stringify({ error: 'Unauthorized' }),
          { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Parse body early to validate ownership
      const body = await req.json();
      const { app_idea_id, artifact_type, user_id } = body;

      if (!app_idea_id || !artifact_type || !user_id) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: app_idea_id, artifact_type, user_id' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Ensure the caller can only request their own data
      if (claimsData.claims.sub !== user_id) {
        return new Response(
          JSON.stringify({ error: 'Forbidden' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Query with service role
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      );

      const { data, error } = await supabase
        .from('artifacts')
        .select(`
          id, type, content, status, version, created_at, app_idea_id,
          app_ideas (
            id, app_name, app_description, one_liner, app_type, app_category,
            persona_description, user_demography, idea_generation, user_id
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
          JSON.stringify({ error: 'Artifact not found' }),
          { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Shared secret authenticated (n8n server-to-server call)
    const body = await req.json();
    const { app_idea_id, artifact_type, user_id } = body;

    if (!app_idea_id || !artifact_type || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: app_idea_id, artifact_type, user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data, error } = await supabase
      .from('artifacts')
      .select(`
        id, type, content, status, version, created_at, app_idea_id,
        app_ideas (
          id, app_name, app_description, one_liner, app_type, app_category,
          persona_description, user_demography, idea_generation, user_id
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
        JSON.stringify({ error: 'Artifact not found' }),
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
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
