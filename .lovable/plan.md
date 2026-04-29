# Plan: Coaching Lead Capture

Add a real inquiry form on `/coaching` so submitted interest creates a row in the `leads` table, with `user_id` populated when the visitor is logged in.

## What changes for the user

- On `/coaching`, clicking **Get Support** or **Talk to Us** opens a short inquiry form (name, email, optional message) before the Calendly embed.
- The selected package (Support Pack / Done For You) and hour tier are auto-filled and shown read-only.
- After submitting, a confirmation appears and the existing Calendly iframe is shown so the user can still book.
- Logged-in users have name/email pre-filled from their profile and the lead is linked to their account.

## UI flow

```text
[Plans view]  →  click CTA  →  [Inquiry form]  →  submit  →  [Calendly view + success toast]
```

The current two-view state machine (`plans` / `form`) becomes three views: `plans` → `inquiry` → `calendly`. Back button returns to the previous step.

## Form fields

| Field    | Type                | Required | Source                                       |
|----------|---------------------|----------|----------------------------------------------|
| name     | text                | yes      | user input (prefilled from profile if logged in) |
| email    | email               | yes      | user input (prefilled from profile if logged in) |
| package  | "support" / "dfy"   | yes      | set by which CTA was clicked                 |
| hours    | number (10/20/40)   | only for Support Pack | from selected tier                  |
| message  | textarea            | no       | user input                                   |

Validation with `zod`: name 1–100 chars, email valid + ≤255 chars, message ≤1000 chars.

## Data write

Insert into `public.leads` via the Supabase client:

```ts
{ name, email, package, hours, message, user_id: session?.user.id ?? null }
```

RLS already allows authenticated users to insert their own leads. For anonymous submissions we will keep `user_id` null — this requires a small RLS adjustment (see Technical notes).

## Files to change

- `src/pages/CoachingPage.tsx` — add `inquiry` view, form, submit handler, prefill from `useAuth` + `useProfile`, success toast, then transition to `calendly` view.
- `src/lib/leads.ts` (new) — small helper `submitCoachingLead(input)` with zod schema + supabase insert.

## Technical notes

- Current `leads` RLS: `INSERT` requires `auth.uid() = user_id` and `SELECT` requires the same. Anonymous submissions will fail. Two options:
  1. Keep authenticated-only — gate the form so anonymous users see a "Sign in to inquire" message.
  2. Allow anonymous inserts — add an `INSERT` policy on `leads` for `anon` role with `WITH CHECK (user_id IS NULL)`.
- Recommend option 1 for now to match existing security posture (no new public-write surface). Anonymous visitors get a CTA to sign in.
- Use `supabase.auth.getSession()` (or existing `useAuth` hook) to resolve `user_id` at submit time.
- Show inline field errors and a top-level error if the insert fails; success uses the existing `sonner` toast.
- Memory `mem://features/coaching-page/booking-flow` will be updated to reflect the new pre-Calendly inquiry step.

## Out of scope

- No email notification / webhook on new lead (can be added later via edge function trigger).
- No admin UI to view leads.
- No changes to `/one-on-one-coaching` (separate spec).
