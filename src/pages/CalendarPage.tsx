import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, ExternalLink, MapPin, Video, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const CALENDAR_ID = "michael@ambitiouslabs.io";

interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  location: string;
  start: string;
  end: string;
  meetLink: string;
  htmlLink: string;
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const { data, error: fnError } = await supabase.functions.invoke(
          "google-calendar-proxy",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ calendarId: CALENDAR_ID }),
          }
        );

        if (fnError) {
          throw new Error(fnError.message || "Edge function error");
        }

        setEvents(data?.events || []);
      } catch (err: any) {
        console.error("Failed to fetch calendar events:", err);
        setError(err.message || "Failed to load events");
      } finally {
        setLoading(false);
      }
    }

    fetchEvents();
  }, []);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const formatDateOnly = (dateStr: string) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  const isAllDay = (start: string) => !start.includes("T");

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-6 w-6 text-blue-400" />
        <h1 className="text-2xl font-bold text-white">Upcoming Events</h1>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      )}

      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4 text-red-300 text-sm">
            {error}
          </CardContent>
        </Card>
      )}

      {!loading && !error && events.length === 0 && (
        <Card className="bg-white/5 border-white/10">
          <CardContent className="p-6 text-center text-slate-400">
            No upcoming events found.
          </CardContent>
        </Card>
      )}

      {events.map((event) => (
        <Card key={event.id} className="bg-white/5 border-white/10 hover:bg-white/[0.07] transition-colors">
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between gap-2">
              <CardTitle className="text-lg text-white">{event.title}</CardTitle>
              {isAllDay(event.start) ? (
                <Badge variant="secondary" className="shrink-0 text-xs">All day</Badge>
              ) : null}
            </div>
            <p className="text-sm text-blue-300">
              {isAllDay(event.start)
                ? formatDateOnly(event.start)
                : `${formatDateTime(event.start)} — ${formatDateTime(event.end)}`}
            </p>
          </CardHeader>
          <CardContent className="space-y-2">
            {event.description && (
              <p className="text-sm text-slate-300 line-clamp-3">{event.description}</p>
            )}
            <div className="flex flex-wrap gap-2 pt-1">
              {event.location && (
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <MapPin className="h-3 w-3" /> {event.location}
                </a>
              )}
              {event.meetLink && (
                <a
                  href={event.meetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-green-400 hover:text-green-300 transition-colors"
                >
                  <Video className="h-3 w-3" /> Join Google Meet
                </a>
              )}
              {event.htmlLink && (
                <a
                  href={event.htmlLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white transition-colors"
                >
                  <ExternalLink className="h-3 w-3" /> View in Google Calendar
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
