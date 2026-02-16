

## Remove Light/Dark Mode Distinction and Fix Text Colors

### Problem
1. The app maintains two separate themes (light and dark) in CSS plus a theme toggle, but only the dark theme is actually used.
2. Some components use `text-muted-foreground` where they should use a secondary text color with better contrast.

### Changes

#### 1. Merge dark theme values into `:root` (src/index.css)
- Replace all `:root` variable values with the current `.dark` values (background, foreground, card, border, sidebar, gradients, shadows, etc.)
- Remove the `.dark { ... }` block entirely since `:root` now IS the dark theme
- Keep `--radius` and kanban/category/priority colors which are identical in both themes

#### 2. Remove theme toggling infrastructure
- **Delete** `src/hooks/useTheme.ts` (no longer needed)
- **Delete** `src/components/ThemeToggle.tsx` (no longer needed)
- **Update** `src/components/layout/Header.tsx` -- remove `ThemeToggle` import and usage from the right section
- **Update** `src/components/ui/sonner.tsx` -- remove `useTheme` from `next-themes`, hardcode theme as `"dark"`

#### 3. Remove `dark:` class prefixes
- **Update** `src/components/ui/badge-2.tsx` -- simplify compound variant classes by removing `dark:` prefixed duplicates and keeping only the dark values as defaults
- **Update** `src/components/ui/alert.tsx` -- remove `dark:border-destructive` (keep the base class)
- **Update** `src/components/ui/chart.tsx` -- simplify `THEMES` constant to only use the root selector

#### 4. Remove darkMode config from Tailwind
- **Update** `tailwind.config.ts` -- remove `darkMode: ["class"]` since there is only one theme

#### 5. Ensure `dark` class is always set on HTML root
- **Update** `src/main.tsx` or `index.html` -- add `class="dark"` to the `<html>` tag so existing Tailwind `dark:` classes still work during any transition period (safety net)

#### 6. Fix text color hierarchy in cards
- **Update** `src/components/dashboard/ArtifactCard.tsx` -- change description text from `text-muted-foreground` to `text-slate-400` (the secondary text color used across the design system)
- **Update** `src/components/dashboard/ArtifactsGrid.tsx` -- change section descriptions from `text-muted-foreground` to `text-slate-400`
- **Update** `src/components/ui/highlight-card.tsx` -- change description text from `text-muted-foreground` to `text-slate-400`

This ensures all cards use a consistent, readable secondary text color that provides good contrast against the dark `#161e2a` card backgrounds.

