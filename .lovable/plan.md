

## Fix: UIUXPage rendering to match actual n8n data structure

### Problem

The actual artifact content uses these keys and formats:
- `typography` → **array of strings** (e.g., `["Roboto for clean body text", ...]`)
- `color_palette` → **array of strings** with embedded hex (e.g., `["#4A90E2 for primary buttons and links", ...]`)
- `spacing_and_layout` → **array of strings**
- `ui_vibe_and_style` → **array of strings**
- `key_ui_components` → **array** (currently empty)

But the page expects:
- `typography` as an object with `headingFont`, `bodyFont`, `scale`
- `color_palette` as array of objects with `hex`/`name` fields
- `spacing` as an object with `unit`, `grid`, `borderRadius`
- `designPrinciples` / `brandTone` — keys that don't exist in the data

### Changes — `src/pages/UIUXPage.tsx`

**1. Update field extraction (lines 62-67)** to match actual keys:

| Current key | Actual key in data | Format |
|---|---|---|
| `designPrinciples` | `ui_vibe_and_style` | string[] |
| `spacing` | `spacing_and_layout` | string[] |
| `componentStyle` | `key_ui_components` | string[] |
| `brandTone` | (not in data) | keep fallback |

**2. Fix color palette rendering** — extract hex from strings like `"#4A90E2 for primary buttons"` using regex `/#[0-9A-Fa-f]{3,8}/`, use the remainder as the label.

**3. Fix typography rendering** — when it's an array of strings, render as a bullet list (same as design principles), not as an object with `headingFont`/`bodyFont`.

**4. Fix spacing rendering** — when it's an array of strings, render as a bullet list.

**5. Fix component style rendering** — same array-of-strings treatment; show empty state if array is empty.

### Technical detail

All rendering sections get this pattern:
```tsx
{Array.isArray(data) ? (
  <ul className="space-y-1.5">
    {data.map((item, i) => (
      <li key={i} className="flex items-start gap-2">
        <span className="...">•</span>{item}
      </li>
    ))}
  </ul>
) : typeof data === 'string' ? (
  <p>{data}</p>
) : (
  // existing object rendering as fallback
)}
```

For colors specifically:
```tsx
const hexMatch = colorStr.match(/#[0-9A-Fa-f]{3,8}/);
const hex = hexMatch?.[0];
const label = colorStr.replace(hex, '').trim();
```

### Scope
- **1 file**: `src/pages/UIUXPage.tsx`
- ~50 lines changed

