

## Plan: Add "Continue / Complete" Chip to Default Suggestions

### Change

**`src/components/artifacts/ArtifactCopilot.tsx`** — Add a completion-focused chip to each entry in the static `SUGGESTIONS` map (lines 13-21).

Each context array gets a new last item: `"Help me complete this artifact to 100%"`

Updated map:
```typescript
const SUGGESTIONS: Record<string, string[]> = {
  business_model: ["What's my revenue model?", "Analyze my competitors", "Suggest pricing tiers", "Help me complete this artifact to 100%"],
  validation: ["Who's my target user?", "What risks should I test?", "Suggest interview questions", "Help me complete this artifact to 100%"],
  product_brief: ["Summarize my MVP scope", "What are the key features?", "Suggest success metrics", "Help me complete this artifact to 100%"],
  ui_ux: ["Suggest a color palette", "What screens do I need?", "Recommend a layout", "Help me complete this artifact to 100%"],
  db_design: ["Suggest a schema", "What tables do I need?", "How should I handle auth?", "Help me complete this artifact to 100%"],
  master_prompt: ["Improve my prompt", "Add edge cases", "Make it more specific", "Help me complete this artifact to 100%"],
  kanban: ["Break down my tasks", "Suggest sprint goals", "What should I prioritize?", "Help me complete this artifact to 100%"],
};
```

Each context drops its 4th niche chip to keep the count at 4, replaced by the universal completion chip. One file, one change.

### Files Modified
- `src/components/artifacts/ArtifactCopilot.tsx` — update static `SUGGESTIONS` map

