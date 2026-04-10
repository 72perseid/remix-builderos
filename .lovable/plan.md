

# Build Basic Calendar Page with Google Calendar Integration

## What We're Building
A basic calendar page that fetches and displays events from a coach's Google Calendar using the public API key approach. The "Calendar" nav item will sit below "Build" in the sidebar.

## Prerequisites (Your Action Items)
Before I build, I need you to provide two things using the secret storage tool:
1. **Google Calendar API Key** — I'll store it as a Supabase secret called `GOOGLE_CALENDAR_API_KEY`
2. **Calendar ID** — I'll hardcode this initially for testing (you can paste it in chat)

## What I'll Build

### 1. Edge Function: `supabase/functions/google-calendar-proxy/index.ts`
- Reads `GOOGLE_CALENDAR_API_KEY` from secrets
- Accepts a `calendarId` query param
- Fetches upcoming events from Google Calendar API v3
- Returns formatted JSON (title, start/end times, description, location/meet link)
- Includes CORS headers

### 2. New Page: `src/pages/CalendarPage.tsx`
- Simple list/card view of upcoming events (no heavy calendar library yet — keep it minimal for testing)
- Calls the edge function to fetch events
- Displays each event: title, date/time (browser timezone), description, Google Meet link if present
- Loading and error states

### 3. Sidebar Update: `src/components/dashboard/DashboardSidebar.tsx`
- Add "Calendar" nav item with `CalendarDays` icon right after "Build"
- Route: `/calendar`

### 4. Route + Layout: `src/App.tsx` and `src/layouts/DashboardLayout.tsx`
- Add `/calendar` route inside `DashboardLayout`
- Hide top nav for calendar page (clean view)

### 5. Config: `supabase/config.toml`
- Add `[functions.google-calendar-proxy]` with `verify_jwt = false`

## Files Summary

| File | Action |
|---|---|
| `supabase/functions/google-calendar-proxy/index.ts` | New |
| `supabase/config.toml` | Edit — add function config |
| `src/pages/CalendarPage.tsx` | New |
| `src/components/dashboard/DashboardSidebar.tsx` | Edit — add Calendar nav item after Build |
| `src/App.tsx` | Edit — add `/calendar` route |
| `src/layouts/DashboardLayout.tsx` | Edit — hide top nav for `/calendar` |

## Next Step
Please share the **Calendar ID** in chat so I can wire it up. I'll then use the secrets tool to request your **API Key**.

