import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const N8N_WEBHOOK = 'https://amblabsdevaccount.app.n8n.cloud/webhook/master_os';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();

    const {
      message,
      user_id,
      session_id,
      workflow_mode,
      app_idea_id,
      app_name,
      app_description,
      app_category,
    } = body;

    console.log('Chat action received:', {
      workflow_mode,
      app_idea_id,
      hasMessage: !!message,
    });

    const response = await fetch(N8N_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message,
        user_id,
        session_id,
        workflow_mode,
        app_idea_id,
        app_name,
        app_description,
        app_category,
      }),
    });

    if (!response.ok) {
      console.error('Webhook error:', response.status, response.statusText);
      throw new Error(`Webhook returned ${response.status}`);
    }

    const data = await response.json();

    console.log('Webhook response received:', {
      hasOutput: !!data?.output,
      hasMessage: !!data?.message,
      isArray: Array.isArray(data),
    });

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Chat action error:', error);

    return new Response(
      JSON.stringify({
        error: 'Failed to process chat request',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
