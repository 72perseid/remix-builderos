import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskColor } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, Pencil, Trash2, GripVertical } from 'lucide-react';
import { format } from 'date-fns';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

const colorClasses: Record<TaskColor, string> = {
  yellow: 'bg-kanban-yellow',
  coral: 'bg-kanban-coral',
  mint: 'bg-kanban-mint',
  lavender: 'bg-kanban-lavender',
  sky: 'bg-kanban-sky',
};

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg p-3 shadow-md transition-all',
        colorClasses[task.color],
        isDragging && 'opacity-50 rotate-2 scale-105 shadow-xl',
        'hover:shadow-lg hover:-translate-y-0.5'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 cursor-grab opacity-0 group-hover:opacity-60 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-foreground/60" />
      </div>

      {/* Content - always dark text for readability */}
      <div className="pr-6 text-gray-900">
        <h4 className="font-semibold text-sm leading-tight mb-1">{task.title}</h4>
        {task.description && (
          <p className="text-xs text-gray-700 line-clamp-2 mb-2">{task.description}</p>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-1 mb-2">
          {task.category && (
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded font-medium',
              task.category === 'MVP' && 'bg-category-mvp/20 text-purple-800',
              task.category === 'V1' && 'bg-category-v1/20 text-teal-800',
              task.category === 'Stretch Goals' && 'bg-category-stretch/20 text-amber-800'
            )}>
              {task.category}
            </span>
          )}
          {task.priority && (
            <span className={cn(
              'text-[10px] px-1.5 py-0.5 rounded font-medium',
              task.priority === 'high' && 'bg-priority-high/20 text-red-800',
              task.priority === 'medium' && 'bg-priority-medium/20 text-orange-800',
              task.priority === 'low' && 'bg-priority-low/20 text-green-800'
            )}>
              {task.priority}
            </span>
          )}
        </div>

        {/* Dates */}
        <div className="flex items-center gap-2 text-[10px] text-gray-600">
          {task.plannedDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {format(new Date(task.plannedDate), 'MMM d')}
            </span>
          )}
          {task.completedDate && (
            <span className="text-green-700">
              ✓ {format(new Date(task.completedDate), 'MMM d')}
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-white/50"
          onClick={() => onEdit(task)}
        >
          <Pencil className="w-3 h-3 text-gray-700" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-white/50"
          onClick={() => onDelete(task.id)}
        >
          <Trash2 className="w-3 h-3 text-gray-700" />
        </Button>
      </div>
    </div>
  );
}
