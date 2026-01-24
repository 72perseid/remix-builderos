import { useArtifact } from '@/hooks/useArtifact';
import { Loader2, LayoutGrid, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';

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

// New 5-column structure
interface MappedColumn {
  id: string;
  title: string;
  color: string;
  cards: {
    id: string;
    tag: string;
    title: string;
    description: string;
  }[];
}

// Column configuration for new 5-column layout
const columnConfig: { id: string; title: string; color: string }[] = [
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

export default function ProjectBoardPage() {
  const { data: artifact, loading } = useArtifact('kanban');

  // Parse artifact content
  const content = artifact?.content as ArtifactContent | null;
  const rawColumns = content?.columns || [];

  // Map old columns to new 5-column structure
  const mappedColumns: MappedColumn[] = columnConfig.map((config) => ({
    ...config,
    cards: [],
  }));

  // Distribute cards from old columns to new columns
  rawColumns.forEach((oldCol) => {
    const oldId = oldCol.id.toLowerCase();
    const newColumnId = columnMapping[oldId] || 'backlog';
    
    const targetColumn = mappedColumns.find((col) => col.id === newColumnId);
    if (targetColumn) {
      oldCol.cards.forEach((card, index) => {
        targetColumn.cards.push({
          id: `${oldCol.id}-${index}`,
          tag: card.tag,
          title: card.title,
          description: card.description,
        });
      });
    }
  });

  const totalCards = mappedColumns.reduce((acc, col) => acc + col.cards.length, 0);

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
            ? `${totalCards} tasks across ${mappedColumns.length} columns`
            : 'Your tasks will appear here once generated'
          }
        </p>
      </div>

      {/* Kanban Board */}
      {totalCards > 0 ? (
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {mappedColumns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-72 bg-[#0f1729] rounded-lg border border-slate-700/50 flex flex-col max-h-[calc(100vh-220px)]"
            >
              {/* Column Header */}
              <div className="p-3 bg-[#1a2744] rounded-t-lg border-b border-slate-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-white text-sm">{column.title}</h3>
                    <span
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white"
                      style={{ backgroundColor: column.color }}
                    >
                      {column.cards.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className="flex-1 overflow-y-auto p-2 space-y-2">
                {column.cards.map((card) => (
                  <div
                    key={card.id}
                    className="bg-[#1a2332] border border-slate-700/50 rounded-lg p-3 cursor-pointer hover:border-slate-600 transition-colors group"
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
                        {card.tag && (
                          <span
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium",
                              card.tag === 'MVP' && "bg-green-500/20 text-green-400 border border-green-500/30",
                              card.tag === 'V1' && "bg-blue-500/20 text-blue-400 border border-blue-500/30",
                              card.tag === 'Stretch Goals' && "bg-purple-500/20 text-purple-400 border border-purple-500/30",
                              !['MVP', 'V1', 'Stretch Goals'].includes(card.tag) && "bg-slate-500/20 text-slate-400 border border-slate-500/30"
                            )}
                          >
                            {card.tag}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Card Button */}
              <div className="p-2 border-t border-slate-700/50">
                <button
                  className="w-full py-2 px-3 bg-[#1a2744] hover:bg-[#243352] text-slate-400 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <span className="text-lg">+</span>
                  New card
                </button>
              </div>
            </div>
          ))}
        </div>
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
