import { useState, useMemo, useCallback } from 'react';
import { useArtifact } from '@/hooks/useArtifact';
import { Loader2, LayoutGrid, GripVertical, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Kanban,
  KanbanBoard,
  KanbanColumn,
  KanbanColumnContent,
  KanbanItem,
  KanbanOverlay,
} from '@/components/ui/kanban';
import { Badge } from '@/components/ui/badge-2';

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

// Card interface for the Kanban
interface KanbanCard {
  id: string;
  tag: string;
  title: string;
  description: string;
  priority?: 'low' | 'medium' | 'high';
}

// Column configuration for new 5-column layout
const COLUMN_CONFIG: { id: string; title: string; color: string }[] = [
  { id: 'backlog', title: 'Backlog', color: '#6B7280' },
  { id: 'selected', title: 'Selected for Development', color: '#3B82F6' },
  { id: 'in_progress', title: 'In Progress', color: '#8B5CF6' },
  { id: 'qa', title: 'In QA', color: '#F59E0B' },
  { id: 'done', title: 'Done', color: '#10B981' },
];

// Map old column IDs to new column IDs
const columnMapping: Record<string, string> = {
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

// Priority badge styling
const priorityStyles: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

// Tag badge styling
const tagStyles: Record<string, string> = {
  MVP: 'bg-green-500/20 text-green-400 border border-green-500/30',
  V1: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'Stretch Goals': 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
};

interface TaskCardProps {
  card: KanbanCard;
  isOverlay?: boolean;
}

function TaskCard({ card, isOverlay }: TaskCardProps) {
  return (
    <div
      className={cn(
        "bg-[#1a2332] border border-slate-700/50 rounded-lg p-3 transition-all group",
        isOverlay 
          ? "shadow-2xl rotate-2 scale-105" 
          : "hover:border-slate-600 cursor-grab active:cursor-grabbing"
      )}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-slate-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">
            {card.title}
          </h4>
          {card.description && (
            <p className="text-xs text-slate-400 line-clamp-2 mb-2">
              {card.description}
            </p>
          )}
          <div className="flex items-center gap-2 flex-wrap">
            {card.tag && (
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium",
                  tagStyles[card.tag] || "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                )}
              >
                {card.tag}
              </span>
            )}
            {card.priority && (
              <span
                className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize border",
                  priorityStyles[card.priority]
                )}
              >
                {card.priority}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface TaskColumnProps {
  columnId: string;
  title: string;
  color: string;
  cards: KanbanCard[];
}

function TaskColumn({ columnId, title, color, cards }: TaskColumnProps) {
  return (
    <KanbanColumn
      value={columnId}
      className="flex-shrink-0 w-72 bg-[#0f1729] rounded-lg border border-slate-700/50 flex flex-col max-h-[calc(100vh-220px)]"
      disabled
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
              {cards.length}
            </span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <KanbanColumnContent value={columnId} className="flex-1 overflow-y-auto p-2 gap-2">
        {cards.map((card) => (
          <KanbanItem key={card.id} value={card.id} className="touch-none">
            <TaskCard card={card} />
          </KanbanItem>
        ))}
      </KanbanColumnContent>

      {/* Add Card Button */}
      <div className="p-2 border-t border-slate-700/50">
        <button className="w-full py-2 px-3 bg-[#1a2744] hover:bg-[#243352] text-slate-400 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          New card
        </button>
      </div>
    </KanbanColumn>
  );
}

export default function ProjectBoardPage() {
  const { data: artifact, loading } = useArtifact('kanban');

  // Parse artifact content and build initial columns
  const initialColumns = useMemo(() => {
    const content = artifact?.content as ArtifactContent | null;
    const rawColumns = content?.columns || [];

    // Initialize empty columns
    const columns: Record<string, KanbanCard[]> = {};
    COLUMN_CONFIG.forEach((config) => {
      columns[config.id] = [];
    });

    // Distribute cards from old columns to new columns
    rawColumns.forEach((oldCol) => {
      const oldId = oldCol.id.toLowerCase();
      const newColumnId = columnMapping[oldId] || 'backlog';

      oldCol.cards.forEach((card, index) => {
        if (columns[newColumnId]) {
          columns[newColumnId].push({
            id: `${oldCol.id}-${index}`,
            tag: card.tag,
            title: card.title,
            description: card.description,
            priority: undefined,
          });
        }
      });
    });

    return columns;
  }, [artifact]);

  const [columns, setColumns] = useState<Record<string, KanbanCard[]>>(initialColumns);

  // Update columns when artifact changes
  useMemo(() => {
    if (Object.values(initialColumns).some(col => col.length > 0)) {
      setColumns(initialColumns);
    }
  }, [initialColumns]);

  const totalCards = Object.values(columns).reduce((acc, col) => acc + col.length, 0);

  // Find card by ID for overlay
  const findCard = useCallback((id: string): KanbanCard | undefined => {
    for (const columnCards of Object.values(columns)) {
      const card = columnCards.find(c => c.id === id);
      if (card) return card;
    }
    return undefined;
  }, [columns]);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Project Board</h1>
        <p className="text-muted-foreground mt-1">
          {totalCards > 0
            ? `${totalCards} tasks across ${COLUMN_CONFIG.length} columns • Drag cards to move them`
            : 'Your tasks will appear here once generated'}
        </p>
      </div>

      {/* Kanban Board */}
      {totalCards > 0 ? (
        <Kanban<KanbanCard>
          value={columns}
          onValueChange={setColumns}
          getItemValue={(item) => item.id}
        >
          <KanbanBoard className="flex-1">
            {COLUMN_CONFIG.map((config) => (
              <TaskColumn
                key={config.id}
                columnId={config.id}
                title={config.title}
                color={config.color}
                cards={columns[config.id] || []}
              />
            ))}
          </KanbanBoard>
          <KanbanOverlay>
            {({ value }) => {
              const card = findCard(value as string);
              if (!card) return null;
              return <TaskCard card={card} isOverlay />;
            }}
          </KanbanOverlay>
        </Kanban>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-slate-700/50 bg-[#161e2a]/80">
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
