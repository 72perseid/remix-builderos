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
    const rawBody = await req.text();

    if (!rawBody?.trim()) {
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: 'Request body is empty' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let body: Record<string, unknown>;
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>;
    } catch (parseError) {
      console.error('Invalid JSON body:', rawBody.substring(0, 500));
      return new Response(
        JSON.stringify({ error: 'Invalid request body', details: 'Malformed JSON payload' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const {
      message,
      user_id,
      session_id,
      workflow_mode,
      app_idea_id,
      app_name,
      app_description,
      app_category,
    } = body as {
      message?: string;
      user_id?: string;
      session_id?: string;
      workflow_mode?: string;
      app_idea_id?: string | null;
      app_name?: string | null;
      app_description?: string | null;
      app_category?: string | null;
    };

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

    const responseText = await response.text();
    console.log('Webhook raw response status:', response.status, 'body length:', responseText.length);

    if (!response.ok) {
      console.error('Webhook error:', response.status, responseText.substring(0, 500));
      throw new Error(`Webhook returned ${response.status}: ${responseText.substring(0, 200)}`);
    }

    let data;
    try {
      data = responseText ? JSON.parse(responseText) : { output: 'No response from assistant.' };
    } catch {
      console.error('Failed to parse webhook response as JSON:', responseText.substring(0, 500));
      data = { output: responseText || 'No response from assistant.' };
    }

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
