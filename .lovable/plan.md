

## Plan: Fix Artifact Copilot Chat Performance (Browser Freezing)

### Root Causes

1. **`onArtifactRefresh` in `sendMessage` useCallback deps** — `onArtifactRefresh` is `query.refetch` passed as a prop. If its reference ever changes, `sendMessage` is recreated, potentially cascading re-renders. More critically, after each AI response, `onArtifactRefresh()` is called which refetches artifact data, re-renders the parent page, which re-renders the copilot panel and all its children.

2. **No memoization on `CopilotMessageBubble`** — Every keystroke or state change re-renders ALL message bubbles. With long AI responses and `whitespace-pre-wrap`, layout recalculation compounds with each message.

3. **Textarea auto-resize triggers layout thrashing** — On every keystroke, `textarea.style.height = 'auto'` followed by reading `scrollHeight` forces a synchronous layout reflow, which gets slower as the DOM grows.

4. **Duplicate component trees** — `ArtifactCopilot` (mobile overlay) and `CopilotPanelContent` (desktop sidebar) are nearly identical but separately implemented, each with their own `useCopilotChat` instance. Both may mount simultaneously.

### Changes

**1. `src/hooks/useCopilotChat.ts` — Stabilize `onArtifactRefresh` with useRef**

Use a ref to hold the latest `onArtifactRefresh` callback so it never appears in the `sendMessage` dependency array. This prevents `sendMessage` from being recreated when the parent re-renders.

```ts
const onArtifactRefreshRef = useRef(onArtifactRefresh);
onArtifactRefreshRef.current = onArtifactRefresh;

// In sendMessage useCallback, use onArtifactRefreshRef.current()
// Remove onArtifactRefresh from deps array
```

**2. `src/components/artifacts/ArtifactCopilot.tsx` — Memoize `CopilotMessageBubble`**

Wrap with `React.memo` so messages only re-render when their own props change:

```tsx
const CopilotMessageBubble = React.memo(({ message }: { message: CopilotMessage }) => {
  // ... existing render
});
```

**3. `src/components/artifacts/ArtifactCopilot.tsx` — Memoize message list**

Wrap the messages `.map()` section in `useMemo` keyed on `messages` array to avoid re-creating JSX elements on unrelated state changes (like `inputValue`).

**4. `src/components/artifacts/ArtifactCopilot.tsx` — Debounce textarea auto-resize**

Use `requestAnimationFrame` for the height recalculation to avoid synchronous layout reflow on every keystroke.

**5. `src/components/artifacts/ArtifactCopilot.tsx` — Extract shared chat content**

Both `CopilotPanelContent` and `ArtifactCopilot` duplicate the same chat UI. Refactor to use a single shared inner component to prevent dual mounting and reduce code surface.

### Technical Details

The freezing pattern (fine initially, degrades after 3-4 messages) is classic re-render amplification: each message adds DOM nodes, and every state change (including keystrokes in the input) forces React to diff and the browser to relayout all accumulated message nodes. The `whitespace-pre-wrap` CSS on long AI responses is particularly expensive for layout. Memoization cuts this from O(n) per keystroke to O(1).

