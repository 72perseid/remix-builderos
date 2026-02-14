

# Change Global Font to Inter

## Overview

Replace the current "Space Grotesk" font with "Inter" across the entire application, ensuring all text uses a single font variable.

## Changes

### 1. `src/index.css`

- Update the Google Fonts import from `Space+Grotesk` to `Inter` (weights 300-700)
- Keep `JetBrains Mono` for code blocks (monospace is a separate concern)
- Update the body font-family to `'Inter', sans-serif`

### 2. `tailwind.config.ts`

- Update `fontFamily.sans` from `['Space Grotesk', 'sans-serif']` to `['Inter', 'sans-serif']`

These two files are the only places the font is defined. All components inherit from the Tailwind `font-sans` class or the body style, so no individual component changes are needed.

## Technical Details

| File | Line | Current | New |
|------|------|---------|-----|
| `src/index.css` | 1 | `Space+Grotesk:wght@300;400;500;600;700` | `Inter:wght@300;400;500;600;700` |
| `src/index.css` | ~108 | `font-family: 'Space Grotesk', sans-serif` | `font-family: 'Inter', sans-serif` |
| `tailwind.config.ts` | ~30 | `sans: ['Space Grotesk', 'sans-serif']` | `sans: ['Inter', 'sans-serif']` |

