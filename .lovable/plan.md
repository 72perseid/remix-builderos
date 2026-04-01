

# Convert Landing Page Generator to Prompt Builder

## What Changes
Replace the current full landing page editor/hosting system with a simple prompt builder (same pattern as Master Prompt page). Instead of building and hosting a landing page inside BuilderOS, it will generate a comprehensive prompt users can copy into Cursor, Bolt, Replit, or any AI coding tool to build a landing page with proper SEO.

## How It Works

1. User clicks "Generate Landing Page Prompt"
2. The copilot AI combines data from existing artifacts (Business Model, Product Brief, UI/UX) into a detailed landing page prompt
3. The prompt includes: headline, subheadline, features, problem statement, target audience, how-it-works steps, CTA text, color palette, theme preference, and SEO metadata
4. User copies the prompt and pastes it into their preferred coding tool

## Technical Plan

### File: `src/pages/LandingPageGeneratorPage.tsx` — Full Rewrite
- Replace the 964-line editor/publisher with a ~150-line prompt builder following `MasterPromptPage.tsx` pattern
- Same structure: prerequisites check → generate button → rendered prompt with copy button
- Prerequisites: `business_model` and `product_brief` (same as master prompt minus db_design/validation since those aren't needed for a landing page)
- Uses `useCopilotChat` with `context: 'landing_page'` to generate the prompt
- Uses `useArtifact('landing_page')` to store/retrieve the generated prompt
- Remove all landing page form state, theme selector, signups tab, publish toggle, stats row, preview panel

### File: `src/hooks/useLandingPage.ts` — Can be kept or removed
- The hook won't be imported by the page anymore; can remove the import but keep the file for now (no breaking changes)

### Files NOT changed
- `src/lib/landingPageThemes.ts` — no longer used by the page, but harmless to keep
- `src/components/landing/ThemeSelector.tsx` — same
- Database tables (`landing_pages`, `landing_page_signups`) — unchanged, just unused by this page going forward
- `src/pages/PublicLandingPage.tsx` — kept as-is (existing published pages still accessible)

### Artifact type
- Uses the existing `landing_page` artifact type in the `artifacts` table to store the generated prompt (same pattern as `master_prompt`)

### UI Structure (matching MasterPromptPage)
1. Title: "Landing Page Prompt" with Rocket icon
2. Subtitle: "Generate a prompt to build a conversion-optimized landing page with any AI coding tool"
3. Prerequisites card (if business_model or product_brief missing)
4. Generate button (if unlocked, no prompt yet)
5. Prompt display with copy button (once generated)
6. CoachCTA at bottom

