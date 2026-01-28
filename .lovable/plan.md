

# Redirect "New App" Flow to Onboarding Page

## Overview

Change the "New App" button behavior to navigate to the full-screen Onboarding AI interface (`/onboarding?mode=new`) instead of opening the sidebar chat.

---

## Current State

### DashboardHeader.tsx (lines 19-23)
```typescript
const handleNewApp = () => {
  clearSelection();              // Step 1: Clear selectedAppId (creation mode)
  setShouldClearOnOpen(true);    // Step 2: Signal to clear chat
  openChat();                    // Step 3: Open chat UI
};
```

### OnboardingPage.tsx already supports `?mode=new`
- **Line 20**: Parses `isNewAppMode` from URL params
- **Lines 48-53**: Clears messages when `isNewAppMode` is true
- **Lines 56-61**: Auto-starts session with `isNewApp` flag
- **Lines 84-88**: Skips updating `profile.onboarded` when in new app mode

---

## Required Changes

### File 1: `src/components/dashboard/DashboardHeader.tsx`

**Changes:**
1. Import `useNavigate` from react-router-dom
2. Remove unused `useChatContext` import (no longer needed)
3. Update `handleNewApp` to navigate instead of opening sidebar chat

```typescript
// Add import
import { useNavigate } from 'react-router-dom';

// Update function
const handleNewApp = () => {
  clearSelection();
  navigate('/onboarding?mode=new');
};
```

### File 2: `src/pages/OnboardingPage.tsx`

**Minor fix needed:** The existing `useEffect` for clearing messages has a dependency issue. When `clearMessages` is in the dependency array and messages change, it could cause unexpected behavior. We need to ensure it only runs once when `isNewAppMode` becomes true.

**Change:** Reset `sessionStarted` flag to trigger a fresh session start.

```typescript
// Lines 48-53 - Already correct but let's ensure proper behavior
useEffect(() => {
  if (isNewAppMode) {
    clearMessages();
    setSessionStarted(false);  // Already present - ensures fresh session
  }
}, [isNewAppMode]);  // Remove clearMessages from deps to avoid re-runs
```

---

## Data Flow

```text
User clicks "New App"
        │
        ▼
┌──────────────────────────┐
│ clearSelection()         │  ← Clears localStorage selection
│ navigate('/onboarding    │
│   ?mode=new')            │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│ OnboardingPage loads     │
│ isNewAppMode = true      │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│ useEffect triggers:      │
│  • clearMessages()       │  ← Clears chat + new session ID
│  • setSessionStarted(    │
│      false)              │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│ Auto-start effect runs:  │
│  startSession(true)      │  ← Sends START_NEW_APP_SESSION
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│ User chats with AI...    │
│ JSON_GENERATION_COMPLETE │
└──────────────────────────┘
        │
        ▼
┌──────────────────────────┐
│ performFinalTransition() │
│  • Skip profile update   │  ← isNewAppMode check
│  • Wait 25s for backend  │
│  • Refresh & navigate    │
└──────────────────────────┘
```

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/dashboard/DashboardHeader.tsx` | Replace `openChat()` with `navigate('/onboarding?mode=new')` |
| `src/pages/OnboardingPage.tsx` | Fix `useEffect` dependency to prevent re-runs |

---

## Edge Cases Handled

1. **Cancel button**: Already shows "Cancel" in new app mode (line 187)
2. **Skip updating onboarded**: Already implemented (lines 84-88, 162-166)
3. **Session ID reset**: `clearMessages()` already generates new session ID
4. **Header title**: Already customized for new app mode (lines 170-173)

