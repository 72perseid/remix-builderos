
# Update Colors and Remove Card Gradients

## Overview

Based on the reference screenshot, we need to:
1. Change the **primary color** from purple to blue
2. Remove all **card gradient backgrounds** in favor of flat solid dark backgrounds
3. Adjust the **accent color** to match the blue theme
4. Update the **sidebar active state** color

## Color Analysis from Screenshot

| Element | Current | Target |
|---------|---------|--------|
| Primary | Purple (262 83% 65%) | Blue (~217 91% 60%) |
| Accent | Teal (172 66% 55%) | Cyan-blue (~199 89% 48%) |
| Card background | Gradient from-[#1a2235] via-[#161e2a] to-[#0f1729] | Flat solid #161e2a |
| Ring | Purple (262 83% 65%) | Blue (~217 91% 60%) |
| Sidebar active | Purple border-primary | Blue border-primary (auto-updated) |

## Changes

### 1. `src/index.css` -- Update CSS variables

**Light mode (:root):**
- `--primary`: 262 83% 58% --> 217 91% 60%
- `--ring`: 262 83% 58% --> 217 91% 60%

**Dark mode (.dark):**
- `--primary`: 262 83% 65% --> 217 91% 60%
- `--ring`: 262 83% 65% --> 217 91% 60%
- `--accent`: 172 66% 55% --> 199 89% 48%
- Remove/simplify `--gradient-primary` and `--gradient-accent` to use new blue

### 2. `src/components/dashboard/ArtifactCard.tsx` -- Flat card background

Replace the multi-layer gradient background system with a simple flat background:
- Remove the 3 gradient background `div` layers (lines 82-84)
- Remove the animated border gradient hover div (lines 87-90)
- Remove the shine effect div (lines 153-155)
- Set the Card itself to use `bg-[#161e2a] border border-slate-700/50 rounded-2xl`

### 3. `src/components/ui/highlight-card.tsx` -- Flat card background

Same treatment as ArtifactCard:
- Remove gradient background layers (lines 30-32)
- Remove animated border gradient (lines 35-38)
- Remove shine effect (lines 84-86)
- Use flat `bg-[#161e2a] border border-slate-700/50`

### 4. `src/components/ui/business-card.tsx` -- Flat card background

- Change gradient class `bg-gradient-to-br from-[#1a2235] via-[#161e2a] to-[#0f1729]` to flat `bg-[#161e2a]`
- Remove the gradient overlay hover div

### 5. `src/pages/ProductBriefPage.tsx`, `src/pages/ValidationPage.tsx`, `src/pages/DatabaseDesignPage.tsx` -- Flat empty state cards

Replace `bg-gradient-to-br from-[#1a2235] via-[#161e2a] to-[#0f1729]` with `bg-[#161e2a]` on empty state cards.

### 6. `src/pages/MasterPromptPage.tsx` -- Flat card background

Remove the multi-layer gradient system and replace with flat `bg-[#161e2a]`.

### 7. `src/components/dashboard/ArchitectBanner.tsx` -- Update gradient colors

Update the banner gradient from purple tones to blue tones to match new primary.

## Impact

- All cards across the app will have a clean, flat dark background
- The purple-to-blue primary shift affects buttons, active states, badges, focus rings, and any component using `text-primary` or `bg-primary`
- The sidebar active state automatically updates since it references `border-primary` and `text-primary`
- Hover effects on cards will be simplified to subtle border/opacity changes instead of gradient animations
