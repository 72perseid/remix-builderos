## Goal

Make the `/artifacts` page match TC-enrollment-4: a Free-tier user (no `build_access`) can fully access **Business Model** but every other artifact card is visibly locked, cannot be navigated to, and cannot trigger generation.

Today `ArtifactsGrid` uses one boolean `canBuild = hasUse('build')` for every card. So either everything is unlocked (paid) or everything is locked (free). We need per-type gating.

## Approach

Introduce a small access helper for artifact types and apply it inside `ArtifactsGrid` + each artifact page (defense-in-depth so direct URL visits are also blocked).

### 1. New helper: `src/lib/artifactAccess.ts`

```ts
import type { Database } from '@/integrations/supabase/types';
type ArtifactType = Database['public']['Enums']['artifact_type'];

// Free tier: only business_model is usable.
const FREE_TIER_ALLOWED: ArtifactType[] = ['business_model'];

export function canAccessArtifact(
  type: ArtifactType,
  hasBuildAccess: boolean,
): boolean {
  if (hasBuildAccess) return true;
  return FREE_TIER_ALLOWED.includes(type);
}
```

Single source of truth — easy to expand later (e.g. add `validation` to free tier).

### 2. Update `src/components/dashboard/ArtifactsGrid.tsx`

- Replace the global `canBuild` gate with per-card `canAccessArtifact(card.type, canBuild)`.
- Pass a new `locked` flag to `ArtifactCard` (or reuse `status="locked"`).
- For locked cards:
  - Show a small "Upgrade" pill (Lock icon + "Upgrade to unlock") in the top-right corner, similar to existing "Coming Soon" pill style.
  - `onClick` opens the existing coaching/upgrade flow (`navigate('/coaching')`) instead of the artifact route.
  - Visually dim (`opacity-60`) and keep the icon/title readable.
- The Landing Copy card in the Launching section already gates on `canBuild` via `handleNavigate` — leave as-is (Free tier still locked there; not part of this spec but consistent).

### 3. Extend `ArtifactCard` (`src/components/dashboard/ArtifactCard.tsx`)

Add an optional `upgradeRequired?: boolean` prop. When true:
- Override the status badge to `<Lock /> Upgrade required`.
- Render a small top-right pill: `Upgrade`.
- Keep `cursor-pointer` so the click handler can route to `/coaching`.
- Skip the completion progress bar.

No changes to the existing `status` enum — `upgradeRequired` is an orthogonal visual layer so completion data still works for paid users.

### 4. Defense-in-depth on artifact pages

For each non-free-tier artifact page (`ValidationPage`, `ProductBriefPage`, `UIUXPage`, `DatabaseDesignPage`, `MasterPromptPage`), reuse the existing `LockedOverlay` pattern (already used by Project Board / Calendar):

```tsx
const { hasUse, loading } = useUserFeatures();
if (loading) return null; // or existing skeleton
if (!hasUse('build')) {
  return (
    <div className="relative min-h-[60vh]">
      <div className="blur-md select-none pointer-events-none">…page…</div>
      <LockedOverlay feature="build" />
    </div>
  );
}
```

This guarantees direct navigation (e.g. typing `/validation` in the URL) cannot trigger any generation API call, satisfying the "Clicking a locked artifact does NOT trigger generation" assertion even if a future card click leaks through.

`BusinessModelPage` is **not** wrapped — it stays accessible to Free tier.

### 5. Block generation triggers

The current generation trigger lives in the DB (`check_completion_and_trigger`) and fires when `bm_completion`, `pb_completion`, `uv_completion` all hit 100. Free users can only complete `bm_completion`, so the trigger naturally won't fire — no DB change needed. The new page-level overlay also prevents the chat/copilot inputs that drive `pb`/`uv` completion from rendering for Free users, so they cannot accidentally bump those metrics.

## Files Touched

- **new** `src/lib/artifactAccess.ts`
- **edit** `src/components/dashboard/ArtifactsGrid.tsx` — per-type gating + click routing
- **edit** `src/components/dashboard/ArtifactCard.tsx` — `upgradeRequired` visual variant
- **edit** `src/pages/ValidationPage.tsx`
- **edit** `src/pages/ProductBriefPage.tsx`
- **edit** `src/pages/UIUXPage.tsx`
- **edit** `src/pages/DatabaseDesignPage.tsx`
- **edit** `src/pages/MasterPromptPage.tsx`

No DB migration. No changes to `useUserFeatures` or `useEnrollment`.

## Test Mapping (TC-enrollment-4)

| Assertion | Covered by |
|---|---|
| `business_model` card enabled/accessible | `FREE_TIER_ALLOWED` includes it; click routes to `/business-model` as today |
| All other cards show locked / upgrade prompt | `upgradeRequired` pill + Lock badge in `ArtifactCard` |
| Clicking a locked artifact does NOT trigger generation | Click routes to `/coaching` instead of artifact route; direct URL is blocked by `LockedOverlay` wrapper that disables pointer events on the underlying page |

## Out of Scope

- Changing which artifacts are free (currently only `business_model`; revisit per product).
- Modifying the n8n generation webhook / DB trigger — current logic already requires all three completions which a Free user cannot reach.
- Updating the openspec doc itself (separate task).
