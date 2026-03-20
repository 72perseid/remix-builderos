

## Plan: Fix scroll-to-bottom after suggestion chips appear + investigate refresh

### Problem
The `requestAnimationFrame` scroll fires too early — before the suggestion chips have actually rendered and taken up space. The ScrollArea content height hasn't updated yet, so it scrolls to a position that's still too high.

### Fix — `src/components/artifacts/ArtifactCopilot.tsx`

**1. Add a delayed scroll after loading finishes (suggestions render)**

Replace the current scroll `useEffect` (lines 122-130) with one that:
- Scrolls immediately on new messages (as before)
- When `isLoading` transitions from `true` → `false`, adds a **1-second delayed scroll** to catch the suggestion chips layout shift

```typescript
const prevLoadingRef = useRef(false);

useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;

  // Always scroll on new messages
  requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });

  // Extra delayed scroll when loading just finished (suggestions appeared)
  if (prevLoadingRef.current && !isLoading) {
    const timer = setTimeout(() => {
      el.scrollTop = el.scrollHeight;
    }, 1000);
    prevLoadingRef.current = isLoading;
    return () => clearTimeout(timer);
  }
  prevLoadingRef.current = isLoading;
}, [messages.length, isLoading]);
```

**2. Random refresh — likely caused by `refetchInterval: 10000`** on the completion query triggering React state updates. Will change to `refetchOnWindowFocus: false` to reduce unnecessary refetches, and ensure the query doesn't cause component-level re-renders by using `select` to stabilize the return value.

### Files Modified
- `src/components/artifacts/ArtifactCopilot.tsx` — improved scroll timing + stabilize completion query

