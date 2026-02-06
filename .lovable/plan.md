
# Change App Font Color to Bright White

## Overview

Update the global CSS variables in `src/index.css` to make all text content bright white throughout the app in dark mode.

## Current State

The dark mode theme currently uses:
- `--foreground: 0 0% 95%` (light gray, not pure white)
- `--card-foreground: 0 0% 95%` (light gray)
- `--popover-foreground: 0 0% 95%` (light gray)
- `--secondary-foreground: 0 0% 95%` (light gray)
- `--muted-foreground: 240 5% 55%` (muted gray - used for secondary text)
- `--sidebar-foreground: 240 4.8% 95.9%` (light gray)

## Changes

### File: `src/index.css`

Update the `.dark` section (lines 65-100) to use bright white (`0 0% 100%`) for all foreground colors:

| CSS Variable | Current Value | New Value |
|--------------|---------------|-----------|
| `--foreground` | `0 0% 95%` | `0 0% 100%` |
| `--card-foreground` | `0 0% 95%` | `0 0% 100%` |
| `--popover-foreground` | `0 0% 95%` | `0 0% 100%` |
| `--secondary-foreground` | `0 0% 95%` | `0 0% 100%` |
| `--muted-foreground` | `240 5% 55%` | `0 0% 85%` |
| `--sidebar-foreground` | `240 4.8% 95.9%` | `0 0% 100%` |
| `--sidebar-accent-foreground` | `240 4.8% 95.9%` | `0 0% 100%` |

The `--muted-foreground` is changed to `0 0% 85%` instead of pure white to maintain some visual hierarchy for secondary/helper text while still being much brighter than before.

## Impact

This change affects all text throughout the app that uses:
- `text-foreground` (main text)
- `text-card-foreground` (card content)
- `text-muted-foreground` (secondary text, descriptions)
- `text-popover-foreground` (dropdown/popover text)
- Sidebar text colors

## Result

All content text will appear as bright white, improving readability and creating a cleaner, more consistent dark theme appearance across the entire application.
