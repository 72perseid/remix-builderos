

# Add Landing Page Theme/Template Selector

## Summary
Add a theme selector to the Page Builder tab that lets users choose from 6 distinct landing page templates. Each theme controls the visual layout and styling of the public landing page (`/lp/:slug`). The selected theme is stored in the database and applied at render time.

## Database Change
Add a `theme` column to `landing_pages`:
```sql
ALTER TABLE public.landing_pages
  ADD COLUMN IF NOT EXISTS theme text DEFAULT 'modern';
```

## Themes (6 templates)

| Theme | Description | Visual Style |
|-------|-------------|-------------|
| **Modern** (default) | Current design — dark bg, gradient accents, glass cards | Dark background, radial gradients, rounded-2xl cards |
| **Minimalist** | Clean, lots of whitespace, light background, simple typography | White/light bg, thin borders, no gradients, serif headings |
| **Bold** | Large typography, vibrant colors, full-width sections, strong contrast | Oversized headings, bold color blocks, no rounded corners |
| **Startup** | Gradient hero with floating shapes, animated feel, tech-forward | Purple-blue gradients, floating blob shapes, pill buttons |
| **Professional** | Corporate/enterprise look, structured grid, muted palette | Gray tones, structured layout, subtle shadows, square cards |
| **Ecommerce** | Product-focused with prominent CTA, trust badges, pricing-style layout | White bg, product card style, prominent buttons, trust icons |

## What Changes

### 1. `useLandingPage.ts`
- Add `theme` field to `LandingPage` interface
- Include `theme` in generate mutation payload

### 2. `LandingPageGeneratorPage.tsx`
- Add `theme` state variable (default: `'modern'`)
- Add a **"Page Theme"** `BusinessCard` section at the top of the editor grid (before Content & Copy)
- Display 6 clickable theme cards in a 3x2 grid, each showing:
  - A small visual preview thumbnail (CSS-rendered mini layout)
  - Theme name and short description
  - Selected state with primary border highlight
- Pass `theme` to the generate mutation
- Populate from existing `landingPage.theme` on load

### 3. `PublicLandingPage.tsx`
- Read `page.theme` (fallback to `'modern'`)
- Create a `themeConfig` object per theme defining: background colors, text colors, border radius, font styles, section spacing, card styles, hero layout variant
- Apply theme config throughout all sections instead of hardcoded styles
- Each theme changes: background (light vs dark), typography scale, card shapes (rounded vs sharp), hero layout (split vs centered vs full-width), section backgrounds, button styles, overall color temperature

### Theme Preview Cards (in editor)
Each card is a tiny CSS-only representation (~120x80px) showing a miniature layout silhouette (nav bar, hero block, feature grid) styled per theme, so users can visually compare before selecting.

## Files Modified
1. `supabase/migrations/` — new migration for `theme` column
2. `src/hooks/useLandingPage.ts` — add theme to interface and mutation
3. `src/pages/LandingPageGeneratorPage.tsx` — theme selector UI in editor
4. `src/pages/PublicLandingPage.tsx` — theme-aware rendering with 6 distinct visual styles

