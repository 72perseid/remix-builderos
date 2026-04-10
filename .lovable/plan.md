

## Plan: Calendar Grid UI for CalendarPage

### Current State
The page displays events as a vertical list of cards — functional but doesn't feel like a calendar.

### What Changes

**Replace the list view with a monthly calendar grid** that shows:
- A month/year header with prev/next navigation arrows
- A 7-column day-of-week grid (Sun–Sat)
- Day cells showing the date number, with event dots/pills rendered inside the correct day
- Clicking a day with events opens a popover or side panel showing event details (title, time, meet link, location)
- Today's date highlighted
- Days outside the current month shown dimmed

**Keep the data fetching and edge function unchanged** — only the rendering layer changes.

### Technical Approach

1. **`src/pages/CalendarPage.tsx`** — Rewrite the render section:
   - Add `currentMonth` state (Date) with prev/next handlers
   - Build a 6×7 grid of day cells for the visible month
   - Group fetched events by date (`YYYY-MM-DD` key)
   - Render colored dots or short title pills in each day cell
   - Use a Popover (from existing `@/components/ui/popover`) to show event details on day click
   - Keep loading/error states as-is

2. **Styling** — Dark theme consistent with existing slate/blue palette:
   - Grid cells: `bg-white/5 border-white/10`
   - Today: `bg-blue-500/20 ring ring-blue-500/40`
   - Event pills: small `bg-blue-500` rounded badges
   - Navigation: chevron buttons matching the existing calendar component style

No new dependencies needed — pure React + Tailwind + existing UI primitives.

