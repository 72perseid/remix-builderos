import { useState, useCallback } from 'react';
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
import { Task, TaskStatus } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { TaskDialog } from './TaskDialog';
import { toast } from 'sonner';

const columns: { id: TaskStatus; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: '#6B7280' },
  { id: 'selected', title: 'Selected for Development', color: '#3B82F6' },
  { id: 'in_progress', title: 'In Progress', color: '#8B5CF6' },
  { id: 'qa', title: 'In QA', color: '#F59E0B' },
  { id: 'done', title: 'Done', color: '#10B981' },
];

export function KanbanBoard() {
  const { tasks, addTask, updateTask, deleteTask, moveTask, getTasksByStatus } = useTasks();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [defaultStatus, setDefaultStatus] = useState<TaskStatus>('backlog');

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

    // Check if dropped directly on a column
    const overColumn = columns.find((col) => col.id === overId);
    
    // Find the task being dragged
    const draggedTask = tasks.find((t) => t.id === activeId);
    if (!draggedTask) return;

    let targetStatus: TaskStatus;
    let newPosition: number;

    if (overColumn) {
      // Dropped directly on a column (usually empty or column header area)
      targetStatus = overColumn.id;
      const tasksInColumn = getTasksByStatus(targetStatus);
      newPosition = tasksInColumn.length; // Add to end
    } else {
      // Dropped on a task - find which column that task is in
      const overTask = tasks.find((t) => t.id === overId);
      if (!overTask) return;
      
      targetStatus = overTask.status;
      const tasksInColumn = getTasksByStatus(targetStatus);
      const overTaskIndex = tasksInColumn.findIndex((t) => t.id === overId);
      newPosition = overTaskIndex >= 0 ? overTaskIndex : tasksInColumn.length;
    }

    // Only update if something changed
    if (draggedTask.status !== targetStatus || draggedTask.position !== newPosition) {
      moveTask(activeId, targetStatus, newPosition);
    }
  }, [tasks, getTasksByStatus, moveTask, columns]);

  const handleAddTask = useCallback((status: TaskStatus) => {
    setEditingTask(null);
    setDefaultStatus(status);
    setDialogOpen(true);
  }, []);

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task);
    setDefaultStatus(task.status);
    setDialogOpen(true);
  }, []);

  const handleSaveTask = useCallback((taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => {
    if (editingTask) {
      updateTask(editingTask.id, taskData);
      toast.success('Task updated');
    } else {
      addTask(taskData);
      toast.success('Task created');
    }
  }, [editingTask, updateTask, addTask]);

  const handleDeleteTask = useCallback((id: string) => {
    deleteTask(id);
    toast.success('Task deleted');
  }, [deleteTask]);

  return (
    <div className="h-full flex flex-col">
      {/* Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              color={column.color}
              tasks={getTasksByStatus(column.id)}
              onAddTask={handleAddTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Task Dialog */}
      <TaskDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        task={editingTask}
        defaultStatus={defaultStatus}
        onSave={handleSaveTask}
      />
    </div>
  );
}
