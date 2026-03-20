

## Fix: Copilot chat not scrolling to show AI reply after suggestion chips appear

### Root Cause

The onboarding page works because it uses a plain `div` with `overflow-y-auto` and a sentinel `<div ref={messagesEndRef} />` at the bottom, calling `scrollIntoView({ behavior: 'smooth' })`.

The copilot chat uses Radix `<ScrollArea>` with `ref={scrollRef}` on the **Root** element. But `scrollTop`/`scrollHeight` don't work on the Radix Root — the actual scrollable element is the **Viewport** nested inside. So `el.scrollTop = el.scrollHeight` silently does nothing.

### Fix — `src/components/artifacts/ArtifactCopilot.tsx`

**Adopt the same pattern as onboarding:**

1. Add a `messagesEndRef = useRef<HTMLDivElement>(null)` sentinel div at the bottom of the message list (inside the ScrollArea, after the last message/loading indicator).

2. Replace the `scrollTop` manipulation with `messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })` — this works regardless of the scroll container implementation.

3. Keep the two-phase scroll logic:
   - **Immediate scroll** on new messages via `requestAnimationFrame`
   - **Delayed 1s scroll** when `isLoading` transitions false → catches suggestion chip layout shift

**Changes (~8 lines):**

```tsx
const messagesEndRef = useRef<HTMLDivElement>(null);

// Replace scroll useEffect:
useEffect(() => {
  requestAnimationFrame(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  });

  if (prevLoadingRef.current && !isLoading) {
    const timer = setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 1000);
    prevLoadingRef.current = isLoading;
    return () => clearTimeout(timer);
  }
  prevLoadingRef.current = isLoading;
}, [messages.length, isLoading]);

// Inside ScrollArea, after loading spinner:
<div ref={messagesEndRef} />
```

### Files Modified
- `src/components/artifacts/ArtifactCopilot.tsx` — switch from broken `scrollTop` to `scrollIntoView` with sentinel div

