
# Revert Artifact Navigation to SPA Mode

## Overview

Change artifact card navigation from opening in a new browser tab (`window.open`) back to using React Router's `useNavigate` hook for same-window SPA navigation. The Focus Mode layout (no sidebar) will remain unchanged.

---

## Current State

### ArtifactsGrid.tsx (lines 99 and 122)
Currently uses `window.open()` to open artifacts in new tabs:
```typescript
onClick={() => window.open(card.route, '_blank')}
```

The component does not import `useNavigate` from react-router-dom.

---

## Solution

### File: `src/components/dashboard/ArtifactsGrid.tsx`

**Change 1: Add import for useNavigate**
Add at the top of the file:
```typescript
import { useNavigate } from 'react-router-dom';
```

**Change 2: Initialize the navigate hook**
Inside the component, add:
```typescript
const navigate = useNavigate();
```

**Change 3: Update click handlers (lines 99 and 122)**
Replace both instances of:
```typescript
onClick={() => window.open(card.route, '_blank')}
```
With:
```typescript
onClick={() => navigate(card.route)}
```

---

## What Stays the Same

- **App.tsx routing** - Artifact routes remain outside `DashboardLayout` (Focus Mode preserved)
- **Artifact page layouts** - Pages still render without the dashboard sidebar
- **Back button behavior** - `ArtifactBackButton` will work correctly with browser history

---

## Navigation Flow After Change

```text
User clicks artifact card
        ↓
navigate('/business-model')  ← SPA navigation (same window)
        ↓
BusinessModelPage renders in Focus Mode (no sidebar)
        ↓
User clicks "Back to Artifacts"
        ↓
navigate('/dashboard')  ← Returns to dashboard
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboard/ArtifactsGrid.tsx` | Add `useNavigate` import, initialize hook, replace `window.open()` with `navigate()` |
