

# 1-on-1 Coaching Page

## Summary
Create a new `/1on1-coaching` page that fetches coaches from the existing `coaches` table and displays them as cards (styled like the "Done For You" card on `/coaching`). Each card shows the coach's image, name, description, skills, languages, rate, and what they can help with. Clicking a card opens the Stripe payment link; on successful return, the user is redirected to the coach's booking URL.

## Coaches Table Schema (existing)
- `id`, `name`, `image`, `description`, `book_for` (JSON string array), `skills` (JSON string array), `languages` (JSON string array), `rate_per_hour`, `booking_url`, `proceed_to_payment` (Stripe payment link), `created_at`, `updated_at`

## New Files

### 1. `src/pages/OneOnOneCoachingPage.tsx`
- Dark gradient background matching the existing coaching page aesthetic
- Header with logo, title "1-on-1 Coaching", subtitle
- Fetches coaches from Supabase: `supabase.from('coaches').select('*')`
- Renders a responsive grid of coach cards (1 col mobile, 2 cols md, 3 cols lg)
- Each card styled like the "Done For You" card: `bg-blue-500/[0.08] border-blue-400/30`, rounded-2xl, backdrop-blur
- Card layout:
  - Coach image (rounded, ~120x120) at top or side
  - Name (text-2xl font-extrabold)
  - Description (text-sm text-slate-300)
  - "Book for" tags as small badges
  - Skills as pill badges
  - Languages shown inline
  - Rate: `$XX/hr` prominent pricing
  - CTA button: "Book Session" — opens `proceed_to_payment` (Stripe link) in new tab with `?success_url` pointing back to a redirect handler
- Loading skeleton state while fetching

### 2. Payment Flow
- The `proceed_to_payment` field contains Stripe Payment Links (e.g., `https://buy.stripe.com/...`)
- On click, open the Stripe payment link in a new tab
- After payment, Stripe redirects to a success URL — we'll append `?success_url=` to the payment link pointing to our app with the booking URL as a param
- Create a small success handler: when the page loads with `?booking_url=` query param, auto-redirect to the coach's booking URL (Calendly/Discord)

**Note**: Stripe Payment Links support `?client_reference_id` and redirect to a success URL. We'll construct the link as: `{proceed_to_payment}?success_url={encodeURIComponent(booking_url)}`

### 3. Route Registration in `App.tsx`
- Add `/1on1-coaching` route, wrapped in `ProtectedRoute` + `DashboardLayout`

## Files Modified
1. **`src/pages/OneOnOneCoachingPage.tsx`** — new page component
2. **`src/App.tsx`** — add route
3. **`src/integrations/supabase/types.ts`** — add `coaches` table type definition

