import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from '@/types';
import { GripVertical, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isPast, parseISO } from 'date-fns';

interface ProjectBoardCardProps {
  task: Task;
  isDragging?: boolean;
}

export function ProjectBoardCard({ task, isDragging }: ProjectBoardCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isOverdue = task.plannedDate && isPast(parseISO(task.plannedDate));
  const dragging = isDragging || isSortableDragging;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        "bg-[#1a2332] border border-slate-700/50 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all group",
        dragging && "opacity-50 shadow-2xl scale-105 rotate-2 ring-2 ring-primary/50",
        !dragging && "hover:border-slate-600"
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-slate-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">
            {task.title}
          </h4>
          {task.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-2">
              {task.description}
            </p>
          )}
          
          <div className="flex items-center gap-2 flex-wrap">
            {/* Category/Tag Badge */}
            {task.category && (
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium",
                  task.category === 'MVP' && "bg-green-500/20 text-green-400 border border-green-500/30",
                  task.category === 'V1' && "bg-blue-500/20 text-blue-400 border border-blue-500/30",
                  task.category === 'Stretch Goals' && "bg-purple-500/20 text-purple-400 border border-purple-500/30",
                  !['MVP', 'V1', 'Stretch Goals'].includes(task.category) && "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                )}
              >
                {task.category}
              </span>
            )}
            
            {/* Priority Badge */}
            {task.priority && task.priority !== 'medium' && (
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium",
                  task.priority === 'high' && "bg-red-500/20 text-red-400 border border-red-500/30",
                  task.priority === 'low' && "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                )}
              >
                {task.priority}
              </span>
            )}
            
            {/* Due Date Badge */}
            {task.plannedDate && (
              <span
                className={cn(
                  "inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium",
                  isOverdue 
                    ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                    : "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                )}
              >
                <Calendar className="w-3 h-3" />
                {format(parseISO(task.plannedDate), 'MMM d')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
