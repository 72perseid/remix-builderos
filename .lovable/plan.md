

## BuilderOS Upsell Feature Plan

### Overview
Three features: (1) completion popup on onboarding finish, (2) progress indicators on artifact cards, (3) coach CTAs on output pages. All upsell links point to a placeholder URL (`/coaching`).

---

### Feature 1: Completion Popup

**Where**: `src/pages/OnboardingPage.tsx`

**What**: Replace the current redirect-on-completion behavior with a dismissable dialog that shows before redirecting to `/artifacts`.

**How**:
- When `isSessionComplete` fires, show a new `Dialog` instead of immediately starting the countdown/redirect
- Dialog content:
  - Headline: "Your idea is taking shape!"
  - Body text about Business Model, User Validation, Product Scope being ready
  - CTA button: "Let's Build This Together" linking to `/coaching`
  - Dismiss/close button (X or "Continue" button)
- On dismiss: proceed with the existing `performFinalTransition()` flow (which redirects to `/artifacts` instead of `/project-board`)
- Update the redirect target from `/project-board` to `/artifacts`

---

### Feature 2: Artifact Card Progress Indicators

**Where**: `src/components/dashboard/ArtifactsGrid.tsx` + `src/components/dashboard/ArtifactCard.tsx`

**What**: Show completion percentage and status label on each planning artifact card (Business Model, Validation, Product Brief).

**How**:
- In `ArtifactsGrid`, fetch `bm_completion`, `uv_completion`, `pb_completion` from `app_ideas` table (using existing `selectedAppId` from `ProjectContext`) with a polling query
- Map completion values to each card type: `business_model` -> `bm_completion`, `validation` -> `uv_completion`, `product_brief` -> `pb_completion`
- Pass `completion` prop to `ArtifactCard`
- In `ArtifactCard`, render a `Progress` bar with percentage when completion is between 0-99, and show "Complete - output generated" label at 100%. Below 100% show "Keep refining" label.

---

### Feature 3: Coach CTAs on Output Pages

**Where**: Three pages get a subtle CTA banner:
- `src/pages/ProjectBoardPage.tsx`: "Not sure how to prioritize this?" + "Talk to an Expert"
- `src/pages/DatabaseDesignPage.tsx`: "Need help deploying this?" + "Talk to an Expert"
- `src/pages/MasterPromptPage.tsx`: "Want someone to run this for you?" + "Talk to an Expert"

**How**:
- Create a reusable `CoachCTA` component (`src/components/dashboard/CoachCTA.tsx`) that accepts `message` and `ctaLabel` props
- Renders a subtle, non-pushy banner with the message and a link/button to `/coaching`
- Styled as a soft card with muted colors, not attention-grabbing
- Add this component to the bottom of each output page's content area

---

### Placeholder Upsell Page

**Where**: `src/pages/CoachingPage.tsx` + new route in `App.tsx`

**What**: A minimal placeholder page at `/coaching` with a heading like "Expert Support Coming Soon" so the links don't 404. This page will later be replaced with the full funnel.

---

### Files to Create
- `src/components/dashboard/CoachCTA.tsx` (reusable coach CTA component)
- `src/pages/CoachingPage.tsx` (placeholder upsell page)

### Files to Modify
- `src/pages/OnboardingPage.tsx` (completion popup + redirect target change)
- `src/components/dashboard/ArtifactsGrid.tsx` (fetch completion data, pass to cards)
- `src/components/dashboard/ArtifactCard.tsx` (accept + render completion prop)
- `src/pages/ProjectBoardPage.tsx` (add CoachCTA)
- `src/pages/DatabaseDesignPage.tsx` (add CoachCTA)
- `src/pages/MasterPromptPage.tsx` (add CoachCTA)
- `src/App.tsx` (add `/coaching` route)

