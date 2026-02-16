import { useState } from 'react';
import { useArtifact } from '@/hooks/useArtifact';
import { useTasks } from '@/hooks/useTasks';
import { KanbanBoard, Column } from '@/components/ui/kanban-board';
import { toast } from 'sonner';
import { Loader2, LayoutGrid } from 'lucide-react';
import { AcceptanceCriteriaItem } from '@/types';
import { ArtifactCopilot, CopilotToggleButton } from '@/components/artifacts/ArtifactCopilot';

// Interface matching the exact n8n output format
interface RoadmapContent {
  columns: {
    id: string;
    title: string;
    cards: {
      tag: string;
      title: string;
      description: string;
      subtasks?: string[];
      acceptance_criteria?: string[];
    }[];
  }[];
}

// Convert string array to checklist item format with unique IDs
function convertToChecklistItems(items: string[] | undefined): AcceptanceCriteriaItem[] {
  if (!items || items.length === 0) return [];
  return items.map(text => ({
    id: crypto.randomUUID(),
    text: text,
    done: false
  }));
}

// Color mapping for columns
const columnColors: Record<string, string> = {
  'backlog': '#8B7355',
  'mvp': '#6B8E23',
  'v1': '#CD853F',
  'stretch': '#556B2F',
  'todo': '#8B7355',
  'in-progress': '#6B8E23',
  'review': '#CD853F',
  'done': '#556B2F',
};

export default function AIKanbanAssistantPage() {
  const { data: artifact, loading } = useArtifact('kanban');
  const { importTasks } = useTasks();
  const [copilotOpen, setCopilotOpen] = useState(false);

  // Parse artifact content with the exact expected structure
  const content = artifact?.content as RoadmapContent | null;
  const rawColumns = content?.columns || [];

  // Transform data to KanbanBoard format
  const kanbanColumns: Column[] = rawColumns.map((col, index) => ({
    id: col.id,
    title: col.title,
    color: columnColors[col.id.toLowerCase()] || Object.values(columnColors)[index % 4],
    tasks: col.cards.map((card, cardIndex) => ({
      id: `${col.id}-${cardIndex}`,
      title: card.title,
      description: card.description,
      tags: [card.tag],
    })),
  }));

  const handleImportToKanban = () => {
    if (rawColumns.length === 0) {
      toast.error('No features to import');
      return;
    }

    // Flatten all cards from all columns
    const allCards = rawColumns.flatMap(col => col.cards);
    
    if (allCards.length === 0) {
      toast.error('No cards to import');
      return;
    }

    const tasksToImport = allCards.map((card) => ({
      title: card.title,
      description: card.description || '',
      status: 'backlog' as const,
      color: 'lavender' as const,
      category: card.tag as 'MVP' | 'V1' | 'Stretch Goals',
      priority: 'medium' as const,
      estimatedEffort: '',
      subtasks: convertToChecklistItems(card.subtasks),
      checklist: convertToChecklistItems(card.acceptance_criteria),
    }));

    importTasks(tasksToImport);
    toast.success(`Imported ${allCards.length} features to Kanban board!`);
  };

  const totalCards = rawColumns.reduce((acc, col) => acc + col.cards.length, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative h-full">
      <div className="overflow-auto h-full">
        <div className="max-w-full space-y-6 p-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Roadmap & Features</h1>
                <p className="text-slate-400 mt-1">
                  {kanbanColumns.length > 0 
                    ? `${totalCards} features across ${kanbanColumns.length} columns • Drag and drop to organize`
                    : 'Your feature roadmap will appear here once generated'
                  }
                </p>
              </div>
              <CopilotToggleButton heading="Product Manager" onClick={() => setCopilotOpen(v => !v)} />
            </div>
          </div>

          {/* Kanban Board */}
          {kanbanColumns.length > 0 ? (
            <KanbanBoard columns={kanbanColumns} />
          ) : (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-slate-700/50 bg-card/80">
              <LayoutGrid className="w-12 h-12 text-slate-500 mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Roadmap Yet</h3>
              <p className="text-slate-400 text-sm text-center max-w-md">
                Use the BuilderOS Architect on the Dashboard to generate your feature roadmap. 
                Once generated, your columns and cards will appear here.
              </p>
            </div>
          )}
        </div>
      </div>

      <ArtifactCopilot context="roadmap" heading="Product Manager" isOpen={copilotOpen} onToggle={() => setCopilotOpen(false)} />
    </div>
  );
}
