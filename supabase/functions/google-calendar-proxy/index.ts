import { corsHeaders } from "@supabase/supabase-js/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Support both query params and body
    const url = new URL(req.url);
    let calendarId = url.searchParams.get("calendarId");

    if (!calendarId && req.body) {
      try {
        const body = await req.json();
        calendarId = body.calendarId;
      } catch {
        // body not JSON, ignore
      }
    }

    if (!calendarId) {
      return new Response(
        JSON.stringify({ error: "calendarId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const apiKey = Deno.env.get("GOOGLE_CALENDAR_API_KEY");
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: "API key not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const now = new Date().toISOString();
    const gcalUrl = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events?key=${apiKey}&timeMin=${now}&singleEvents=true&orderBy=startTime&maxResults=50`;

    const gcalRes = await fetch(gcalUrl);
    if (!gcalRes.ok) {
      const errText = await gcalRes.text();
      console.error("Google Calendar API error:", errText);
      return new Response(
        JSON.stringify({ error: "Failed to fetch calendar events", details: errText }),
        { status: gcalRes.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await gcalRes.json();

    const events = (data.items || []).map((item: any) => ({
      id: item.id,
      title: item.summary || "Untitled",
      description: item.description || "",
      location: item.location || "",
      start: item.start?.dateTime || item.start?.date || "",
      end: item.end?.dateTime || item.end?.date || "",
      meetLink: item.hangoutLink || "",
      htmlLink: item.htmlLink || "",
    }));

    return new Response(JSON.stringify({ events }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
