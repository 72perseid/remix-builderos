import { KanbanBoard } from '@/components/kanban/KanbanBoard';

export default function ProjectBoardPage() {
  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Project Board</h1>
        <p className="text-slate-400 mt-1">
          Manage your tasks across different stages of development
        </p>
      </div>
      <KanbanBoard />
    </div>
  );
}
