import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, TaskStatus } from '@/types';
import { ProjectBoardCard } from './ProjectBoardCard';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProjectBoardColumnProps {
  id: TaskStatus;
  title: string;
  color: string;
  tasks: Task[];
  onAddTask?: () => void;
}

export function ProjectBoardColumn({ id, title, color, tasks, onAddTask }: ProjectBoardColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex-shrink-0 w-72 bg-[#0f1729] rounded-lg border flex flex-col max-h-[calc(100vh-220px)] transition-all duration-200",
        isOver 
          ? "border-primary/50 ring-2 ring-primary/20" 
          : "border-slate-700/50"
      )}
    >
      {/* Column Header */}
      <div className="p-3 bg-[#1a2744] rounded-t-lg border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white text-sm">{title}</h3>
            <span
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
              style={{ backgroundColor: color }}
            >
              {tasks.length}
            </span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
        <div 
          className={cn(
            "flex-1 overflow-y-auto p-2 space-y-2 min-h-[100px] transition-colors",
            isOver && "bg-primary/5"
          )}
        >
          {tasks.map((task) => (
            <ProjectBoardCard key={task.id} task={task} />
          ))}
          
          {tasks.length === 0 && (
            <div className="h-20 flex items-center justify-center border-2 border-dashed border-slate-700/30 rounded-lg">
              <p className="text-xs text-slate-500">Drop tasks here</p>
            </div>
          )}
        </div>
      </SortableContext>

      {/* Add Card Button */}
      <div className="p-2 border-t border-slate-700/50">
        <button
          onClick={onAddTask}
          className="w-full py-2 px-3 bg-[#1a2744] hover:bg-[#243352] text-slate-400 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New card
        </button>
      </div>
    </div>
  );
}
