

# Plan: Improve Landing Page Generator & Public Landing Page

## Problem
The current generated public landing page (`/lp/:slug`) is bare-bones — just a headline, subheadline, features grid, and a signup form. No hero image, no social proof, no problem/solution framing, no rich content pulled from artifacts. It doesn't entice visitors to sign up.

## What Changes

### 1. Expand the data model (new DB columns)
Add these columns to `landing_pages` via SQL migration:
- `hero_image_url text` — hero/banner image URL
- `problem_statement text` — the problem being solved (from Product Brief)
- `target_audience text` — who it's for (from Business Model customer segments)
- `social_proof_text text` — a trust/credibility line
- `how_it_works jsonb` — steps array (from Product Brief v1 features)
- `value_proposition text` — pulled from Business Model

**SQL to run:**
```sql
ALTER TABLE public.landing_pages
  ADD COLUMN IF NOT EXISTS hero_image_url text,
  ADD COLUMN IF NOT EXISTS problem_statement text,
  ADD COLUMN IF NOT EXISTS target_audience text,
  ADD COLUMN IF NOT EXISTS social_proof_text text,
  ADD COLUMN IF NOT EXISTS how_it_works jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS value_proposition text;
```

### 2. Enhance auto-fill to pull richer artifact data
Update `autoGenerate()` in the Generator page to also extract:
- **Product Brief artifact**: `problem_statement`, `core_value_proposition`, `v1_features` (mapped to "How It Works" steps), `product_tone`
- **Business Model artifact**: `customerSegments` → target audience text, `valueProposition`, `monetizationStrategy`
- **App Idea**: `app_for`, `persona_description` for audience context

### 3. Add new editor sections in the Generator page
New `BusinessCard` sections in the Page Builder tab:
- **Hero Image** — URL input + file upload option (using app logo as fallback), with preview thumbnail
- **Problem & Solution** — problem statement textarea + value proposition textarea
- **Target Audience** — who this is for, auto-filled from customer segments
- **How It Works** — ordered steps list (like features but numbered), pulled from v1_features
- **Social Proof** — editable trust line (e.g., "Trusted by 500+ early adopters")

### 4. Redesign the Public Landing Page (`/lp/:slug`)
Transform from a minimal hero+features layout into a full, conversion-optimized page with these sections:

```text
┌──────────────────────────────────────┐
│  Nav bar (logo + app name)           │
├──────────────────────────────────────┤
│  HERO SECTION                        │
│  - Headline + subheadline            │
│  - CTA button + email input          │
│  - Hero image (right side or below)  │
│  - Social proof line                 │
├──────────────────────────────────────┤
│  PROBLEM SECTION                     │
│  - "The Problem" heading             │
│  - Problem statement text            │
│  - Target audience callout           │
├──────────────────────────────────────┤
│  SOLUTION / VALUE PROP               │
│  - Value proposition statement       │
│  - Key differentiators               │
├──────────────────────────────────────┤
│  HOW IT WORKS (numbered steps)       │
│  - 3-4 steps from v1_features       │
├──────────────────────────────────────┤
│  FEATURES GRID (existing)            │
│  - Feature cards with icons          │
├──────────────────────────────────────┤
│  FINAL CTA SECTION                   │
│  - Repeated signup form              │
│  - Urgency/scarcity text             │
├──────────────────────────────────────┤
│  FOOTER                              │
│  - Built with BuilderOS              │
└──────────────────────────────────────┘
```

Design details:
- Gradient hero background with animated subtle pattern
- Hero image displayed in a browser mockup frame or floating card
- Alternating section backgrounds (dark/slightly lighter) for visual rhythm
- Numbered "How It Works" steps with connecting lines
- Feature cards with colored icon circles
- Second CTA section at the bottom to capture visitors who scroll through

### 5. Update the in-editor Preview
Mirror the new public page layout in the preview panel so users see what they're building.

### 6. Update the `useLandingPage` hook
- Add new fields to the `LandingPage` interface
- Include new columns in generate/update mutations

## Files to Modify
1. **`src/hooks/useLandingPage.ts`** — add new fields to interface and mutations
2. **`src/pages/LandingPageGeneratorPage.tsx`** — add new editor sections, enhance auto-fill, update preview
3. **`src/pages/PublicLandingPage.tsx`** — full redesign with multiple sections
4. **`src/hooks/useArtifact.ts`** — no changes needed (already supports all artifact types)

## Prerequisite
You need to run the ALTER TABLE SQL above in your Supabase SQL editor before I implement the code changes.

