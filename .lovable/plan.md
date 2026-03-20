

## Fix: 100% completion popup not triggering during live chat session

### Problem

The `completionData` query in `ChatContent` fetches once on mount and never again. When the copilot chat updates `bm_completion` (or similar) from 85 to 100 in the database mid-conversation, the cached query still holds `85`, so `isComplete` remains `false` and the popup never appears.

It only works when you open the page with completion already at 100% because the initial fetch returns 100.

### Fix — `src/components/artifacts/ArtifactCopilot.tsx`

Add a `refetchInterval: 10000` (10s polling) to the completion query so it picks up database changes made by the backend during the chat session. This matches the same polling pattern already used on the Product Brief page (line 56 of `ProductBriefPage.tsx`).

Additionally, trigger an immediate refetch when `isLoading` transitions from `true` to `false` (i.e., after each AI response), since that's the exact moment completion is most likely to have changed.

| Change | Detail |
|--------|--------|
| Add `refetchInterval: 10000` to the completion `useQuery` | Catches background updates within 10s |
| Capture the `refetch` function from the query | To trigger on-demand refetch |
| After `isLoading` goes false, call `refetch()` | Immediate check right after AI responds |

### Scope
- **1 file**: `src/components/artifacts/ArtifactCopilot.tsx`
- ~5 lines changed

