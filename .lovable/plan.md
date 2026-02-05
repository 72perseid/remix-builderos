
# Enhanced Master Prompt Page with Prerequisites Lock

## Overview

This plan adds a gated workflow to the Master Prompt page that enforces artifact prerequisites before allowing generation. Users must complete their Business Model, Database Design, Kanban (Roadmap), and Validation artifacts before they can generate the master prompt.

---

## User Experience Flow

```text
+---------------------+     +---------------------+     +---------------------+
|   LOCKED STATE      |     |    READY STATE      |     |   CONTENT STATE     |
|---------------------|     |---------------------|     |---------------------|
| Missing artifacts:  |     | All prerequisites   |     | Master prompt       |
| - Business Model    | --> |      complete       | --> |    generated        |
| - Database Design   |     |                     |     |                     |
|                     |     | [Generate Prompt]   |     | [Copy to Clipboard] |
| Links to pages      |     |      button         |     |    Code block       |
+---------------------+     +---------------------+     +---------------------+
```

---

## Technical Implementation

### File to Modify
`src/pages/MasterPromptPage.tsx`

### 1. Add Required Dependencies

**New imports:**
- `useArtifacts` hook to fetch all artifacts for the current app
- `useNavigate` for navigation to missing artifact pages
- `AlertTriangle` icon for warning state
- `Link2` icon for linking to pages

### 2. Define Prerequisites Constant

```typescript
const REQUIRED_ARTIFACTS = ['business_model', 'db_design', 'kanban', 'validation'] as const;

const ARTIFACT_LABELS: Record<string, { label: string; route: string }> = {
  business_model: { label: 'Business Model', route: '/business-model' },
  db_design: { label: 'Database Design', route: '/database-design' },
  kanban: { label: 'Roadmap / Kanban', route: '/project-board' },
  validation: { label: 'Validation Strategy', route: '/validation' },
};
```

### 3. Calculate Missing Artifacts

```typescript
// Inside component
const { artifacts: allArtifacts, loading: artifactsLoading } = useArtifacts();

const missingArtifacts = REQUIRED_ARTIFACTS.filter(
  (type) => !allArtifacts.some((a) => a.type === type)
);

const isUnlocked = missingArtifacts.length === 0;
```

### 4. Add Locked State UI

When `missingArtifacts.length > 0`, display:

| Element | Description |
|---------|-------------|
| Warning Card | Yellow-tinted card with `AlertTriangle` icon |
| Title | "Prerequisites Missing" |
| Description | "Complete the following artifacts before generating your Master Prompt:" |
| Missing List | Clickable links to each missing artifact page |
| Disabled Button | "Generate Master Prompt" button (disabled) |

```typescript
{!isUnlocked && (
  <Card className="bg-amber-500/10 border-amber-500/30">
    <CardContent className="p-8">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center">
          <AlertTriangle className="w-6 h-6 text-amber-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-amber-400 mb-2">
            Prerequisites Missing
          </h3>
          <p className="text-muted-foreground text-sm mb-4">
            Complete the following artifacts before generating your Master Prompt:
          </p>
          <ul className="space-y-2">
            {missingArtifacts.map((type) => (
              <li key={type}>
                <Button
                  variant="link"
                  className="text-primary p-0 h-auto"
                  onClick={() => navigate(ARTIFACT_LABELS[type].route)}
                >
                  <Link2 className="w-4 h-4 mr-2" />
                  {ARTIFACT_LABELS[type].label}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </CardContent>
  </Card>
)}
```

### 5. Update Ready State (Empty but Unlocked)

When `isUnlocked && !promptContent`:

- Show "Generate Master Prompt" button that triggers the Copilot
- Add a `useRef` to access the Copilot's `sendMessage` function
- Or: Show a toast directing user to the Copilot sidebar

```typescript
{isUnlocked && !promptContent && (
  <Card className="bg-card/50 border-border">
    <CardContent className="p-12 text-center">
      {/* Icon and text */}
      <Button 
        variant="default" 
        size="lg"
        className="gap-2"
        onClick={handleGeneratePrompt}
      >
        <Sparkles className="w-4 h-4" />
        Generate Master Prompt
      </Button>
    </CardContent>
  </Card>
)}
```

### 6. Auto-Trigger Generation (Optional Enhancement)

To allow the "Generate Master Prompt" button to auto-send a message to the Copilot:

**Option A (Simpler):** Show a toast directing the user to the sidebar
```typescript
const handleGeneratePrompt = () => {
  toast.info('Use the AI Assistant on the left to generate your Master Prompt');
};
```

**Option B (Direct Integration):** Use the Copilot hook directly in the page
```typescript
const { sendMessage: triggerGeneration, isLoading: generating } = useCopilotChat({
  context: 'master_prompt',
  onArtifactRefresh: refetchArtifact,
});

const handleGeneratePrompt = async () => {
  await triggerGeneration('Generate my master prompt by combining all my project artifacts');
};
```

### 7. Loading State Update

Combine loading states for both hooks:

```typescript
if (artifactLoading || artifactsLoading) {
  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
    </div>
  );
}
```

---

## Complete Component State Logic

```typescript
// State determination
const isLoading = artifactLoading || artifactsLoading;
const isUnlocked = missingArtifacts.length === 0;
const hasContent = !!promptContent;

// Render logic
if (isLoading) return <LoadingSpinner />;

return (
  <div className="flex h-full">
    <main>
      {!isUnlocked && <LockedWarningCard missingArtifacts={missingArtifacts} />}
      {isUnlocked && !hasContent && <ReadyStateCard onGenerate={handleGeneratePrompt} />}
      {isUnlocked && hasContent && <ContentDisplay content={promptContent} onCopy={handleCopy} />}
    </main>
    <ArtifactCopilot context="master_prompt" onArtifactRefresh={refetchArtifact} />
  </div>
);
```

---

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/MasterPromptPage.tsx` | Add prerequisite checking, locked state UI, route navigation |

---

## Summary of Changes

1. Import `useArtifacts` hook and navigation utilities
2. Define `REQUIRED_ARTIFACTS` constant and label/route mapping
3. Calculate `missingArtifacts` by comparing required types against fetched data
4. Render locked state with clickable links when prerequisites are missing
5. Show ready state with generate button when unlocked but empty
6. Keep existing content state with copy functionality
7. Combine loading states from both hooks
