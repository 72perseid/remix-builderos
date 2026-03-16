

## Plan: Add Suggestion Bubbles to Artifact Copilot Chat

### Approach

Add context-aware suggestion chips that appear above the text input. They show when there are no messages (initial state) and after each assistant reply. Clicking a chip sends that text as a message. Suggestions are defined per `context` (artifact type) so each specialist offers relevant prompts.

### Changes

**1. `src/components/artifacts/ArtifactCopilot.tsx` — Add suggestion chips UI**

- Define a `SUGGESTIONS` map keyed by context (`business_model`, `validation`, `product_brief`, `ui_ux`) with 3-4 short prompts each, e.g.:
  - `business_model`: "What's my revenue model?", "Analyze my competitors", "Suggest pricing tiers"
  - `validation`: "Who's my target user?", "What risks should I test?", "Suggest interview questions"
  - `product_brief`: "Summarize my MVP scope", "What are the key features?", "Suggest success metrics"
  - `ui_ux`: "Suggest a color palette", "What screens do I need?", "Recommend a layout"

- Render suggestion chips in the `ChatContent` component, positioned between the message area and the input form. Show them when `messages.length === 0` OR when the last message is from the assistant (not while loading).

- Each chip is a small rounded button styled to match the dark theme (`bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs`). Clicking calls `sendMessage(chipText)`.

- Hide suggestions while `isLoading` is true.

**2. Suggestion chip component (inline in same file)**

```tsx
// Small pill-shaped buttons in a flex-wrap row
<div className="flex flex-wrap gap-2 px-3 py-2">
  {suggestions.map(text => (
    <button
      key={text}
      onClick={() => { setInputValue(''); sendMessage(text); }}
      className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 transition-colors"
    >
      {text}
    </button>
  ))}
</div>
```

### No other files need changes
The suggestions are purely a UI feature inside `ChatContent`. The hook and edge function remain unchanged.

