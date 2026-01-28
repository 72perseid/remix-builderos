

# Remove Empty State from Project Board

## Problem

The Project Board currently shows a "No Tasks Yet" placeholder when there are zero tasks, preventing users who skipped onboarding from seeing the empty Kanban columns and adding cards manually.

## Location

**File:** `src/pages/ProjectBoardPage.tsx`  
**Lines:** 607-628

## Current Code

```tsx
{totalCards > 0 ? <Kanban<KanbanCard> value={columns} onValueChange={handleColumnsChange} getItemValue={item => item.id}>
    <KanbanBoard className="flex-1 gap-3">
      {COLUMN_CONFIG.map(config => <TaskColumn key={config.id} columnId={config.id} title={config.title} cards={columns[config.id] || []} onAddCard={handleOpenAddDialog} onEditCard={handleEditCard} />)}
    </KanbanBoard>
    <KanbanOverlay>
      {({ value }) => {
        const card = findCard(value as string);
        if (!card) return null;
        return <TaskCard card={card} isOverlay />;
      }}
    </KanbanOverlay>
  </Kanban> : (/* Empty State */
<div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-slate-700/50 bg-[#161e2a]/80">
    <LayoutGrid className="w-12 h-12 text-muted-foreground mb-4" />
    <h3 className="text-lg font-semibold text-white mb-2">No Tasks Yet</h3>
    <p className="text-slate-400 text-sm text-center max-w-md">
      Use the BuilderOS Architect on the Dashboard to generate your feature roadmap.
      Once generated, your tasks will appear here organized by development stage.
    </p>
  </div>)}
```

## Solution

Remove the ternary conditional and always render the `<Kanban>` component:

```tsx
<Kanban<KanbanCard> value={columns} onValueChange={handleColumnsChange} getItemValue={item => item.id}>
  <KanbanBoard className="flex-1 gap-3">
    {COLUMN_CONFIG.map(config => <TaskColumn key={config.id} columnId={config.id} title={config.title} cards={columns[config.id] || []} onAddCard={handleOpenAddDialog} onEditCard={handleEditCard} />)}
  </KanbanBoard>
  <KanbanOverlay>
    {({ value }) => {
      const card = findCard(value as string);
      if (!card) return null;
      return <TaskCard card={card} isOverlay />;
    }}
  </KanbanOverlay>
</Kanban>
```

## Changes Summary

| Item | Action |
|------|--------|
| `totalCards > 0 ?` check | Remove |
| Empty state `<div>` block | Delete entirely |
| `<Kanban>` component | Always render |

## Result

After this change, users who skip onboarding will see all 5 empty columns (Backlog, Selected for Development, In Progress, In QA, Done) with "Add a card" buttons, allowing them to create tasks immediately.

