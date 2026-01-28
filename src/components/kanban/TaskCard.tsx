import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar, Pencil, Trash2, GripVertical } from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';
import { InlineTagEditor } from './InlineTagEditor';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
}

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

  // Check if task is overdue
  const isOverdue = task.plannedDate && isPast(new Date(task.plannedDate)) && !isToday(new Date(task.plannedDate)) && task.status !== 'done';
  const isDueToday = task.plannedDate && isToday(new Date(task.plannedDate));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative rounded-lg p-3 bg-[#1a2332] border border-slate-700/50 transition-all cursor-pointer',
        isDragging && 'opacity-50 rotate-1 scale-105 shadow-xl',
        'hover:border-slate-600 hover:bg-[#1e2940]'
      )}
    >
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute top-2 right-2 cursor-grab opacity-0 group-hover:opacity-60 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-slate-500" />
      </div>

      {/* Content */}
      <div className="pr-6">
        <h4 className="font-medium text-sm text-white leading-tight mb-1">{task.title}</h4>
        {task.description && (
          <p className="text-xs text-slate-400 line-clamp-2 mb-2">{task.description}</p>
        )}

        {/* Tags & Priority Badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {/* Dynamic project tags with inline editing */}
          {task.tags?.slice(0, 3).map(tag => (
            <InlineTagEditor key={tag.id} tag={tag} />
          ))}
          {(task.tags?.length || 0) > 3 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded text-slate-400 bg-slate-700/50">
              +{task.tags!.length - 3}
            </span>
          )}
          {/* Priority badge */}
          {task.priority && (
            <span className={cn(
              'text-[10px] px-2 py-0.5 rounded font-medium border capitalize',
              task.priority === 'high' && 'bg-red-500/10 text-red-400 border-red-500/30',
              task.priority === 'medium' && 'bg-orange-500/10 text-orange-400 border-orange-500/30',
              task.priority === 'low' && 'bg-green-500/10 text-green-400 border-green-500/30'
            )}>
              {task.priority}
            </span>
          )}
        </div>

        {/* Due Date */}
        {task.plannedDate && (
          <div className="flex items-center gap-1">
            <span className={cn(
              'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium border',
              isOverdue && 'bg-red-500/20 text-red-400 border-red-500/40',
              isDueToday && !isOverdue && 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40',
              !isOverdue && !isDueToday && 'bg-slate-600/30 text-slate-400 border-slate-500/30'
            )}>
              <Calendar className="w-3 h-3" />
              {format(new Date(task.plannedDate), 'MMM d')}
            </span>
          </div>
        )}

        {/* Completed indicator */}
        {task.completedDate && task.status === 'done' && (
          <div className="mt-2 text-[10px] text-green-400">
            ✓ Completed {format(new Date(task.completedDate), 'MMM d')}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-slate-700"
          onClick={(e) => {
            e.stopPropagation();
            onEdit(task);
          }}
        >
          <Pencil className="w-3 h-3 text-slate-400" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 hover:bg-red-900/30"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(task.id);
          }}
        >
          <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-400" />
        </Button>
      </div>
    </div>
  );
}
