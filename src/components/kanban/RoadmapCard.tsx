import { cn } from '@/lib/utils';

interface RoadmapCardProps {
  card: {
    title: string;
    description: string;
    tag: string;
  };
}

const tagColors: Record<string, string> = {
  MVP: 'bg-green-500/20 text-green-400 border-green-500/30',
  V1: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  Stretch: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

export function RoadmapCard({ card }: RoadmapCardProps) {
  const tagColor = tagColors[card.tag] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';

  return (
    <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-700/50 hover:border-slate-600/50 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <h4 className="text-sm font-medium text-white leading-snug">
          {card.title}
        </h4>
        <span className={cn(
          'text-[10px] px-2 py-0.5 rounded border whitespace-nowrap',
          tagColor
        )}>
          {card.tag}
        </span>
      </div>
      {card.description && (
        <p className="text-xs text-secondary-foreground line-clamp-2">
          {card.description}
        </p>
      )}
    </div>
  );
}
