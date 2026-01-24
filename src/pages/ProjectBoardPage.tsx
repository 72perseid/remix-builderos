import { useState, useEffect, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useArtifact } from '@/hooks/useArtifact';
import { useTasks } from '@/hooks/useTasks';
import { Task, TaskStatus } from '@/types';
import { Loader2, LayoutGrid, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ProjectBoardColumn } from '@/components/kanban/ProjectBoardColumn';
import { ProjectBoardCard } from '@/components/kanban/ProjectBoardCard';

// Interface matching the artifact content structure
interface ArtifactContent {
  columns: {
    id: string;
    title: string;
    cards: {
      tag: string;
      title: string;
      description: string;
    }[];
  }[];
}

// Column configuration for 5-column layout
const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: '#6B7280' },
  { id: 'selected', title: 'Selected for Development', color: '#3B82F6' },
  { id: 'in_progress', title: 'In Progress', color: '#8B5CF6' },
  { id: 'qa', title: 'In QA', color: '#F59E0B' },
  { id: 'done', title: 'Done', color: '#10B981' },
];

// Map old column IDs to new column IDs
const columnMapping: Record<string, TaskStatus> = {
  'backlog': 'backlog',
  'todo': 'selected',
  'to-do': 'selected',
  'mvp': 'selected',
  'v1': 'in_progress',
  'in-progress': 'in_progress',
  'in_progress': 'in_progress',
  'review': 'qa',
  'qa': 'qa',
  'stretch': 'backlog',
  'done': 'done',
};

export default function ProjectBoardPage() {
  const { data: artifact, loading: artifactLoading } = useArtifact('kanban');
  const { tasks, loading: tasksLoading, importTasks, moveTask, getTasksByStatus } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [hasImported, setHasImported] = useState(false);

  // Parse artifact content
  const content = artifact?.content as ArtifactContent | null;
  const rawColumns = content?.columns || [];

  // Auto-import from artifact if tasks are empty and artifact has data
  useEffect(() => {
    if (!artifactLoading && !tasksLoading && !hasImported && tasks.length === 0 && rawColumns.length > 0) {
      handleImportFromArtifact();
    }
  }, [artifactLoading, tasksLoading, hasImported, tasks.length, rawColumns.length]);

  const handleImportFromArtifact = useCallback(() => {
    if (rawColumns.length === 0) return;

    const tasksToImport: Parameters<typeof importTasks>[0] = [];

    rawColumns.forEach((oldCol) => {
      const oldId = oldCol.id.toLowerCase();
      const newStatus = columnMapping[oldId] || 'backlog';

      oldCol.cards.forEach((card) => {
        tasksToImport.push({
          title: card.title,
          description: card.description || '',
          status: newStatus,
          priority: 'medium',
          category: card.tag as Task['category'],
          color: 'lavender',
        });
      });
    });

    if (tasksToImport.length > 0) {
      importTasks(tasksToImport);
      setHasImported(true);
      toast.success(`Imported ${tasksToImport.length} tasks from roadmap`);
    }
  }, [rawColumns, importTasks]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id);
    if (task) setActiveTask(task);
  }, [tasks]);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find target column - either directly dropped on column or on a task in a column
    const overColumn = columns.find((col) => col.id === overId);
    const overTask = tasks.find((t) => t.id === overId);
    const targetStatus = overColumn?.id || overTask?.status;

    if (!targetStatus) return;

    const activeTask = tasks.find((t) => t.id === activeId);
    if (!activeTask) return;

    // Only move if status changed
    if (activeTask.status !== targetStatus) {
      const tasksInColumn = getTasksByStatus(targetStatus);
      const newPosition = tasksInColumn.length;
      moveTask(activeId, targetStatus, newPosition);
      toast.success(`Moved to ${columns.find(c => c.id === targetStatus)?.title}`);
    }
  }, [tasks, getTasksByStatus, moveTask]);

  const loading = artifactLoading || tasksLoading;
  const totalTasks = tasks.length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Project Board</h1>
          <p className="text-muted-foreground mt-1">
            {totalTasks > 0 
              ? `${totalTasks} tasks across ${columns.length} columns • Drag to reorganize`
              : 'Your tasks will appear here once generated'
            }
          </p>
        </div>
        {rawColumns.length > 0 && tasks.length === 0 && (
          <Button onClick={handleImportFromArtifact} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Import from Roadmap
          </Button>
        )}
      </div>

      {/* Kanban Board with DnD */}
      {totalTasks > 0 ? (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
            {columns.map((column) => (
              <ProjectBoardColumn
                key={column.id}
                id={column.id}
                title={column.title}
                color={column.color}
                tasks={getTasksByStatus(column.id)}
              />
            ))}
          </div>

          <DragOverlay>
            {activeTask && (
              <ProjectBoardCard task={activeTask} isDragging />
            )}
          </DragOverlay>
        </DndContext>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-border bg-card/50">
          <LayoutGrid className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Tasks Yet</h3>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            Use the BuilderOS Architect on the Dashboard to generate your feature roadmap. 
            Once generated, your tasks will appear here organized by development stage.
          </p>
        </div>
      )}
    </div>
  );
}
