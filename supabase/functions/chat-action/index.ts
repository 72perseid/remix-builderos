import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Webhook URLs
const STANDARD_CHAT_WEBHOOK = 'https://amblabsdevaccount.app.n8n.cloud/webhook/4c31dc75-04a8-4638-b2f5-b94b2ab0de59';
const COPILOT_WEBHOOK = 'https://amblabsdevaccount.app.n8n.cloud/webhook/158807ed-765b-4429-aa08-3688f7122393';

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    
    const { 
      message, 
      user_id, 
      session_id, 
      app_idea_id, 
      context,
      workflowMode,
      is_new_app 
    } = body;

    console.log('Chat action received:', {
      workflowMode,
      context,
      app_idea_id,
      hasMessage: !!message,
    });

    // Determine which webhook to use based on workflowMode
    const targetUrl = workflowMode === 'copilot' ? COPILOT_WEBHOOK : STANDARD_CHAT_WEBHOOK;
    
    console.log(`Routing to: ${workflowMode === 'copilot' ? 'COPILOT' : 'STANDARD'} webhook`);

    // Forward the request to the appropriate n8n webhook
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        user_id,
        session_id,
        app_idea_id,
        context,
        workflowMode,
        is_new_app,
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
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
