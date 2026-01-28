

# Kanban Tag Management System Implementation Plan

## Overview
Update the Kanban system to use the new `project_tags` and `task_tags` tables, replacing the old `category` column. **Critical performance optimization**: Tags will be fetched WITH tasks in a single query and passed down as props to avoid N+1 query problems.

## Database Schema (Already Created)

| Table | Columns |
|-------|---------|
| `project_tags` | id (uuid), label (text), color (text, default '#6366f1'), app_idea_id (uuid), created_at |
| `task_tags` | task_id (uuid), tag_id (uuid) - junction table |

## Implementation Steps

### Step 1: Update Type Definitions

**File: `src/types/index.ts`**

Add `ProjectTag` interface and update `Task` to include tags:

```typescript
export interface ProjectTag {
  id: string;
  label: string;
  color: string;
  app_idea_id: string;
  created_at?: string;
}

export interface Task {
  // ... existing fields ...
  tags?: ProjectTag[];  // NEW: Tags loaded via join
  // Remove: category?: TaskCategory;
}
```

### Step 2: Update useTasks Hook with Join Query (Critical Performance)

**File: `src/hooks/useTasks.ts`**

Modify the main query to fetch tasks WITH their tags in a single request:

```typescript
const { data, error } = await supabase
  .from('tasks')
  .select(`
    *,
    task_tags (
      project_tags (
        id,
        label,
        color,
        app_idea_id
      )
    )
  `)
  .eq('user_id', user.id)
  .eq('app_idea_id', selectedAppId)
  .order('position', { ascending: true });
```

Transform the nested response to flatten tags:

```typescript
return (data || []).map(task => ({
  // ... existing mapping ...
  tags: (task.task_tags || [])
    .map(tt => tt.project_tags)
    .filter(Boolean) as ProjectTag[],
}));
```

Remove all `category` references from insert/update mutations.

### Step 3: Create useProjectTags Hook

**File: `src/hooks/useProjectTags.ts`** (New)

Dedicated hook for tag management operations:

- `tags` - All project tags for current app
- `createTag(label, color)` - Insert into `project_tags`
- `deleteTag(tagId)` - Delete from `project_tags`
- `linkTagToTask(taskId, tagId)` - Insert into `task_tags`
- `unlinkTagFromTask(taskId, tagId)` - Delete from `task_tags`

Key implementation:

```typescript
export function useProjectTags() {
  const { selectedAppId } = useProjectContext();
  const queryClient = useQueryClient();

  // Fetch all project tags
  const { data: tags = [] } = useQuery({
    queryKey: ['project-tags', selectedAppId],
    queryFn: async () => {
      const { data } = await supabase
        .from('project_tags')
        .select('*')
        .eq('app_idea_id', selectedAppId);
      return data as ProjectTag[];
    },
  });

  // Create, delete, link, unlink mutations...
}
```

### Step 4: Update TaskCard Component (Receive Tags as Props)

**File: `src/components/kanban/TaskCard.tsx`**

Update props interface to accept tags (already on the task object):

```typescript
interface TaskCardProps {
  task: Task;  // Task now includes tags?: ProjectTag[]
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}
```

Replace category badge with dynamic tag pills:

```tsx
{/* Tags */}
<div className="flex flex-wrap gap-1.5 mb-2">
  {task.tags?.slice(0, 3).map(tag => (
    <span
      key={tag.id}
      className="text-[10px] px-2 py-0.5 rounded font-medium"
      style={{
        backgroundColor: `${tag.color}20`,
        color: tag.color,
        border: `1px solid ${tag.color}40`
      }}
    >
      {tag.label}
    </span>
  ))}
  {(task.tags?.length || 0) > 3 && (
    <span className="text-[10px] px-1 text-slate-400">
      +{task.tags!.length - 3}
    </span>
  )}
  {/* Priority badge remains */}
</div>
```

### Step 5: Update TaskDialog with Tag Management UI

**File: `src/components/kanban/TaskDialog.tsx`**

Replace the Category selector with a comprehensive Tags section:

**UI Components to Add:**
1. **Current Tags Display**: Colored pills with "x" to unlink
2. **Add Tag Dropdown**: Popover with searchable list of project tags
3. **Create New Tag**: Inline form with label input + color picker
4. **Manage Tags Button**: Opens dialog to delete project-level tags

**State Management:**
```typescript
const [linkedTags, setLinkedTags] = useState<ProjectTag[]>([]);
const [pendingLinks, setPendingLinks] = useState<string[]>([]);
const [pendingUnlinks, setPendingUnlinks] = useState<string[]>([]);

// Initialize from task when dialog opens
useEffect(() => {
  if (task) {
    setLinkedTags(task.tags || []);
  }
}, [task, open]);
```

**Save Flow:**
```typescript
const handleSave = async () => {
  // 1. Save task (existing logic)
  onSave({ ...taskData });
  
  // 2. Process tag links/unlinks
  for (const tagId of pendingLinks) {
    await linkTagToTask(task.id, tagId);
  }
  for (const tagId of pendingUnlinks) {
    await unlinkTagFromTask(task.id, tagId);
  }
  
  // 3. Invalidate tasks query to refresh
  queryClient.invalidateQueries(['tasks']);
};
```

---

## Data Flow Diagram

```text
useTasks Hook (Single Query)
    |
    +--> SELECT tasks.*, task_tags(project_tags(*))
    |
    +--> Transform: Flatten task_tags.project_tags -> task.tags[]
    |
    v
KanbanBoard
    |
    +--> getTasksByStatus() returns Task[] with tags
    |
    v
KanbanColumn
    |
    +--> Receives tasks: Task[] (with tags)
    |
    v
TaskCard
    |
    +--> Renders task.tags as colored pills (NO FETCH!)
```

---

## File Changes Summary

### New Files
| File | Purpose |
|------|---------|
| `src/hooks/useProjectTags.ts` | Hook for tag CRUD + link/unlink operations |

### Modified Files
| File | Changes |
|------|---------|
| `src/types/index.ts` | Add `ProjectTag` interface, add `tags` to Task, remove `category` |
| `src/hooks/useTasks.ts` | Update query with join, map tags, remove category from mutations |
| `src/components/kanban/TaskCard.tsx` | Display dynamic tags from props, remove category badge |
| `src/components/kanban/TaskDialog.tsx` | Replace Category with Tags UI (display, add, create, unlink) |

---

## UI Component Designs

### Tags Section in TaskDialog

```text
+-----------------------------------------------+
| Tags                                          |
+-----------------------------------------------+
| [MVP ×] [Backend ×]     [+ Add Tag ▼]         |
+-----------------------------------------------+

Add Tag Popover:
+---------------------------+
| Search tags...            |
+---------------------------+
| ● Frontend                |
| ● API                     |
| ● Database                |
+---------------------------+
| + Create new tag...       |
+---------------------------+
```

### Create Tag Inline Form

```text
+---------------------------+
| Label: [_______________]  |
| ● ● ● ● ● ● ● ●          |
| [Cancel]  [Create]        |
+---------------------------+
```

### Tag Pills on TaskCard

```text
+----------------------------------+
| Task Title                       |
| Description text...              |
|                                  |
| [MVP] [Backend] [+2]  [high]    |
| 📅 Jan 28                        |
+----------------------------------+
```

---

## Color Palette for Tags

| Name | Hex |
|------|-----|
| Indigo (default) | #6366f1 |
| Red | #ef4444 |
| Orange | #f97316 |
| Amber | #f59e0b |
| Green | #22c55e |
| Teal | #14b8a6 |
| Blue | #3b82f6 |
| Purple | #a855f7 |
| Pink | #ec4899 |
| Gray | #6b7280 |

---

## Query Keys for React Query

```typescript
// Tasks with their tags (single query)
['tasks', user?.id, selectedAppId]

// All project tags for dropdown/management
['project-tags', selectedAppId]
```

---

## Technical Details

### Supabase Join Query Structure

The query uses Supabase's nested select syntax for many-to-many relationships:

```typescript
supabase
  .from('tasks')
  .select(`
    *,
    task_tags (
      project_tags (
        id,
        label,
        color,
        app_idea_id
      )
    )
  `)
```

Response structure:
```json
{
  "id": "task-uuid",
  "title": "...",
  "task_tags": [
    { "project_tags": { "id": "tag-uuid", "label": "MVP", "color": "#6366f1" } },
    { "project_tags": { "id": "tag-uuid-2", "label": "Backend", "color": "#22c55e" } }
  ]
}
```

Transformation to flatten:
```typescript
const tags = (task.task_tags || [])
  .map(tt => tt.project_tags)
  .filter(Boolean);
```

### Cache Invalidation Strategy

When tags are linked/unlinked/created/deleted:
1. Invalidate `['tasks', ...]` to refresh task list with updated tags
2. Invalidate `['project-tags', ...]` to refresh tag dropdown

This ensures UI stays in sync without refetching on every operation.

