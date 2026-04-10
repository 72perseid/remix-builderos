import { useEffect, useState, useMemo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, ChevronLeft, ChevronRight, ExternalLink, MapPin, Video, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

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

function getMonthGrid(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0=Sun
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(year, month, 1 - startOffset + i);
    cells.push(d);
  }
  return cells;
}

function dateKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function eventDateKey(start: string) {
  if (!start) return "";
  // All-day events have no "T"
  if (!start.includes("T")) return start;
  const d = new Date(start);
  return dateKey(d);
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

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
        if (fnError) throw new Error(fnError.message || "Edge function error");
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

  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    for (const ev of events) {
      const key = eventDateKey(ev.start);
      if (!key) continue;
      if (!map[key]) map[key] = [];
      map[key].push(ev);
    }
    return map;
  }, [events]);

  const grid = useMemo(
    () => getMonthGrid(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth]
  );

  const today = dateKey(new Date());
  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthLabel = currentMonth.toLocaleString(undefined, { month: "long", year: "numeric" });

  const prev = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  const next = () => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));

  const formatTime = (s: string) => {
    if (!s || !s.includes("T")) return "All day";
    return new Date(s).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  };

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-6 w-6 text-blue-400" />
          <h1 className="text-2xl font-bold text-white">{monthLabel}</h1>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={prev} className="h-8 w-8 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors inline-flex items-center justify-center">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={next} className="h-8 w-8 rounded-md hover:bg-white/10 text-slate-400 hover:text-white transition-colors inline-flex items-center justify-center">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400" />
        </div>
      )}

      {error && (
        <Card className="border-red-500/30 bg-red-500/10">
          <CardContent className="p-4 text-red-300 text-sm">{error}</CardContent>
        </Card>
      )}

      {!loading && !error && (
        <div className="rounded-lg border border-white/10 overflow-hidden">
          {/* Day-of-week header */}
          <div className="grid grid-cols-7 bg-white/5">
            {DAYS.map((d) => (
              <div key={d} className="py-2 text-center text-xs font-medium uppercase tracking-wide text-slate-500">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7">
            {grid.map((day, i) => {
              const key = dateKey(day);
              const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
              const isToday = key === today;
              const dayEvents = eventsByDate[key] || [];

              const cell = (
                <div
                  className={`min-h-[5.5rem] border-t border-l border-white/5 p-1.5 transition-colors
                    ${isCurrentMonth ? "bg-white/[0.02]" : "bg-transparent"}
                    ${isToday ? "bg-blue-500/10 ring-1 ring-inset ring-blue-500/30" : ""}
                    ${dayEvents.length > 0 && isCurrentMonth ? "hover:bg-white/[0.06] cursor-pointer" : ""}
                  `}
                >
                  <span className={`text-xs font-medium block mb-1 ${isToday ? "text-blue-400" : isCurrentMonth ? "text-slate-300" : "text-slate-600"}`}>
                    {day.getDate()}
                  </span>
                  {dayEvents.slice(0, 3).map((ev) => (
                    <div key={ev.id} className="text-[10px] leading-tight truncate rounded px-1 py-0.5 mb-0.5 bg-blue-500/20 text-blue-300">
                      {ev.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-slate-500 px-1">+{dayEvents.length - 3} more</div>
                  )}
                </div>
              );

              if (dayEvents.length === 0) return <div key={i}>{cell}</div>;

              return (
                <Popover key={i}>
                  <PopoverTrigger asChild>{cell}</PopoverTrigger>
                  <PopoverContent className="w-72 bg-slate-900 border-white/10 p-3 space-y-2">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                      {day.toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}
                    </p>
                    {dayEvents.map((ev) => (
                      <div key={ev.id} className="space-y-1 border-t border-white/5 pt-2 first:border-0 first:pt-0">
                        <p className="text-sm font-medium text-white">{ev.title}</p>
                        <p className="text-xs text-blue-300">{formatTime(ev.start)}</p>
                        {ev.description && <p className="text-xs text-slate-400 line-clamp-2">{ev.description}</p>}
                        <div className="flex flex-wrap gap-2">
                          {ev.location && (
                            <a href={`https://maps.google.com/?q=${encodeURIComponent(ev.location)}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white">
                              <MapPin className="h-3 w-3" /> {ev.location}
                            </a>
                          )}
                          {ev.meetLink && (
                            <a href={ev.meetLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-green-400 hover:text-green-300">
                              <Video className="h-3 w-3" /> Meet
                            </a>
                          )}
                          {ev.htmlLink && (
                            <a href={ev.htmlLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[10px] text-slate-400 hover:text-white">
                              <ExternalLink className="h-3 w-3" /> Open
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </PopoverContent>
                </Popover>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
