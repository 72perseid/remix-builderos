

## Plan: Hybrid Dynamic Lesson Thumbnails (Initials + Keyword Icon)

Replace the plain gradient placeholder on lesson cards with a dynamic thumbnail that combines:
- **Hashed gradient background** — unique per lesson title
- **Large faded initials** — layered in the back
- **Keyword-matched Lucide icon** — layered on top, semantically hinting at content

### Visual

```text
┌──────────────────┐
│░░░░░ AB ░░░░░░░│   ← faded initials (back layer, white/10)
│░░░░ ▶ ░░░░░░░░│   ← icon (front layer, white/90)
└──────────────────┘
   gradient hue derived from title hash
```

### Keyword → Icon map (extensible)

| Keywords in title | Icon |
|---|---|
| video, watch, intro | `PlayCircle` |
| build, create, make | `Hammer` |
| market, audience, customer | `Megaphone` |
| design, ui, ux, brand | `Palette` |
| code, dev, api, tech | `Code2` |
| launch, ship, release | `Rocket` |
| validate, test, research | `FlaskConical` |
| money, price, revenue, model | `DollarSign` |
| plan, strategy, roadmap | `Map` |
| write, copy, content | `PenLine` |
| _fallback_ | `BookOpen` |

### Files

| File | Action |
|---|---|
| `src/lib/lessonThumbnail.ts` | **Create** — exports `getLessonThumbnail(title)` returning `{ gradient, initials, Icon }` |
| `src/components/programs/LessonThumbnail.tsx` | **Create** — small component that renders the gradient + initials + icon stack |
| `src/pages/CourseDetailPage.tsx` | **Edit** — replace the `bg-gradient-to-br from-primary/20 to-primary/5` placeholder with `<LessonThumbnail title={lesson.title} />` (keep the existing real-thumbnail `<img>` path as-is) |

### Implementation notes

- **Hash function**: simple `djb2` over the title string → modulo 360 for hue. Deterministic, no deps.
- **Gradient**: `linear-gradient(135deg, hsl(h, 55%, 28%), hsl((h+45)%360, 55%, 18%))` — keeps it dark-theme friendly.
- **Initials**: first letter of first 1–2 significant words (skip "the", "a", "an", "of", "to"), uppercase, max 2 chars. Rendered `text-4xl font-bold text-white/10` absolutely centered.
- **Icon**: `text-white/90 h-8 w-8` absolutely centered on top of the initials.
- **Reusable**: The `LessonThumbnail` component can be reused later on the lesson page sidebar / "Up Next" cards.

