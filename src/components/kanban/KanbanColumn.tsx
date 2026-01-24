import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface KanbanColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  onAddTask: (status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

export function KanbanColumn({
  id,
  title,
  color,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col min-w-[280px] w-[280px] rounded-lg bg-[#0f1729] border border-slate-700/50 transition-all',
        isOver && 'ring-2 ring-blue-500/50 bg-blue-900/10'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-3 bg-[#1a2744] rounded-t-lg border-b border-slate-700/50">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm text-white">{title}</h3>
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold text-white"
            style={{ backgroundColor: color }}
          >
            {tasks.length}
          </span>
        </div>
      </div>

      {/* Tasks */}
      <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>
        
        {tasks.length === 0 && (
          <div className="text-center py-8 text-slate-500 text-sm">
            No tasks
          </div>
        )}
      </div>

      {/* New Card Button */}
      <div className="p-2 border-t border-slate-700/50">
        <Button
          variant="ghost"
          className="w-full bg-[#1a2744] hover:bg-[#243352] text-slate-400 hover:text-white rounded-lg h-9"
          onClick={() => onAddTask(id)}
        >
          <Plus className="w-4 h-4 mr-2" />
          New card
        </Button>
      </div>
    </div>
  );
}
