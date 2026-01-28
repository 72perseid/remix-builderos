
# Add "Start Building" CTA to Project Board

## Overview

Add a consistent "Start Building" call-to-action banner to both the Artifacts tab and Project Board tab, with both redirecting users to the onboarding chat at `/onboarding?mode=setup`.

## Changes Required

### File 1: `src/components/ProtectedRoute.tsx`

**Update the mode check logic** to allow `mode=setup`:

```tsx
// Current:
const isNewAppMode = searchParams.get('mode') === 'new';

// Updated:
const mode = searchParams.get('mode');
const isAllowedMode = mode === 'new' || mode === 'setup';
```

Update the redirect condition:
```tsx
// Change from:
if (profile && profile.onboarded === true && isOnOnboardingPage && !isNewAppMode) {

// To:
if (profile && profile.onboarded === true && isOnOnboardingPage && !isAllowedMode) {
```

---

### File 2: `src/components/dashboard/ArtifactsGrid.tsx`

**Change the banner's onClick** from opening the sidebar chat to navigating to onboarding:

```tsx
// Current:
<ArchitectBanner onStartBuilding={openChat} hasData={hasAnyData} />

// Updated:
<ArchitectBanner 
  onStartBuilding={() => navigate('/onboarding?mode=setup')} 
  hasData={hasAnyData} 
/>
```

Remove the unused `useChatContext` import since `openChat` is no longer needed.

---

### File 3: `src/pages/ProjectBoardPage.tsx`

**Add the ArchitectBanner** above the Kanban board:

Add imports:
```tsx
import { useNavigate } from 'react-router-dom';
import { ArchitectBanner } from '@/components/dashboard/ArchitectBanner';
```

Add navigation hook and data check:
```tsx
const navigate = useNavigate();
const hasAnyData = totalCards > 0;
```

Add banner above the Kanban component:
```tsx
return <div className="h-full flex flex-col">
  {/* Architect Banner */}
  <ArchitectBanner 
    onStartBuilding={() => navigate('/onboarding?mode=setup')} 
    hasData={hasAnyData} 
  />
  
  {/* Kanban Board */}
  <Kanban<KanbanCard> ...>
```

---

## Summary

| File | Change |
|------|--------|
| `ProtectedRoute.tsx` | Allow `mode=setup` to access onboarding |
| `ArtifactsGrid.tsx` | Navigate to `/onboarding?mode=setup` instead of opening chat |
| `ProjectBoardPage.tsx` | Add ArchitectBanner with same navigation |

## Result

After these changes:
- Users see "Start Building" on both Artifacts and Project Board tabs
- Clicking either button navigates to `/onboarding?mode=setup`
- Users who previously skipped can re-enter onboarding to generate content
