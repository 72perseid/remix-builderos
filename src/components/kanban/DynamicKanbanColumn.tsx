import { RoadmapCard } from './RoadmapCard';

interface DynamicKanbanColumnProps {
  column: {
    id: string;
    title: string;
    cards: {
      tag: string;
      title: string;
      description: string;
    }[];
  };
}

export function DynamicKanbanColumn({ column }: DynamicKanbanColumnProps) {
  return (
    <div className="flex-shrink-0 w-72 bg-slate-800/50 rounded-xl border border-slate-700/50 p-3">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="font-medium text-white text-sm">{column.title}</h3>
        <span className="text-xs text-slate-500 bg-slate-700/50 px-2 py-0.5 rounded-full">
          {column.cards.length}
        </span>
      </div>
      <div className="space-y-2">
        {column.cards.length === 0 ? (
          <p className="text-xs text-secondary-foreground text-center py-4">No items yet</p>
        ) : (
          column.cards.map((card, idx) => (
            <RoadmapCard key={idx} card={card} />
          ))
        )}
      </div>
    </div>
  );
}
