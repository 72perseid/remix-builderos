

## Increase Muted Text Contrast

### Problem
The `muted-foreground` color used for secondary text throughout the app lacks sufficient contrast against the dark backgrounds, making it hard to read.

### Solution
Bump the lightness of `--muted-foreground` in both themes in `src/index.css`:

**Dark mode** (line 77): Change from `0 0% 85%` to `0 0% 92%` -- noticeably brighter without being pure white, maintaining hierarchy below the 100% white primary text.

**Light mode** (line 25): Change from `240 4% 46%` to `240 4% 38%` -- darker against the light background for better contrast.

### File
`src/index.css` -- two single-line changes, no other files affected. Every component using `text-muted-foreground` (labels, descriptions, timestamps, list items across all pages) will automatically pick up the new values.

