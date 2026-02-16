

# App Details Page: Responsive Grid + Unified Borders

## 1. Responsive Grid Layout

Restructure `AppDetailsPage.tsx` to use a proper responsive grid system:

- The outer container gets a responsive max-width and full-width on mobile
- Section 1 (Basic Information): Logo + fields use a responsive grid -- stack vertically on mobile, side-by-side on larger screens
- Sections 3 and 4 (Description and Target Audience): Textarea fields use a 2-column grid on desktop (`md:grid-cols-2`), stacking to 1 column on mobile
- Sections 2 and 5 (toggle buttons): Already use `flex` with `flex-1` children, which works well responsively
- The "Who is this app for?" and "B2B/B2C" button groups will wrap on very small screens by adding `flex-wrap`

## 2. Consolidated Border Color

The app defines `--border: 240 6% 20%` and `--input: 240 6% 20%` (same value). However, the sidebar uses hardcoded `border-slate-800/50` instead of the semantic token. To unify:

- **Input, Textarea, SelectTrigger** -- already use `border-input` which resolves to `hsl(240, 6%, 20%)`. No change needed here.
- **DashboardSidebar.tsx** -- replace all `border-slate-800/50` references with `border-sidebar-border` (which maps to `--sidebar-border`). To fully unify with the rest of the app, update `--sidebar-border` in `index.css` from `240 3.7% 15.9%` to match `--border` at `240 6% 20%`.
- **Footer divider** on AppDetailsPage already uses `border-border` -- correct.

## Technical Changes

### File: `src/pages/AppDetailsPage.tsx`
- Change outer container from `max-w-3xl` to `max-w-4xl w-full`
- Section 1: Keep the logo + fields flex layout but make it responsive with `flex-col sm:flex-row`
- Sections 3 and 4: Wrap textarea fields in a `grid grid-cols-1 md:grid-cols-2 gap-4` container so they sit side-by-side on wider screens

### File: `src/index.css`
- Update `--sidebar-border` from `240 3.7% 15.9%` to `240 6% 20%` to match `--border`

### File: `src/components/dashboard/DashboardSidebar.tsx`
- Replace `border-slate-800/50` with `border-sidebar-border` on the sidebar root and footer elements

