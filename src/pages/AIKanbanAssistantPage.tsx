import { Button } from '@/components/ui/button';
import { useArtifact } from '@/hooks/useArtifact';
import { useTasks } from '@/hooks/useTasks';
import { DynamicKanbanColumn } from '@/components/kanban/DynamicKanbanColumn';
import { toast } from 'sonner';
import { Download, Loader2, LayoutGrid } from 'lucide-react';

// Interface matching the exact n8n output format
interface RoadmapContent {
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

export default function AIKanbanAssistantPage() {
  const { data: artifact, loading } = useArtifact('kanban');
  const { importTasks } = useTasks();

  // Parse artifact content with the exact expected structure
  const content = artifact?.content as RoadmapContent | null;
  const columns = content?.columns || [];

  const handleImportToKanban = () => {
    if (columns.length === 0) {
      toast.error('No features to import');
      return;
    }

    // Flatten all cards from all columns
    const allCards = columns.flatMap(col => col.cards);
    
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
    }));

    importTasks(tasksToImport);
    toast.success(`Imported ${allCards.length} features to Kanban board!`);
  };

  const totalCards = columns.reduce((acc, col) => acc + col.cards.length, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-full space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Roadmap & Features</h1>
          <p className="text-slate-400 mt-1">
            {columns.length > 0 
              ? `${totalCards} features across ${columns.length} columns`
              : 'Your feature roadmap will appear here once generated'
            }
          </p>
        </div>
        
        {columns.length > 0 && (
          <Button 
            onClick={handleImportToKanban} 
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4 mr-2" />
            Import All to Kanban
          </Button>
        )}
      </div>

      {/* Dynamic Columns */}
      {columns.length > 0 ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <DynamicKanbanColumn key={column.id} column={column} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-slate-700/50 bg-slate-800/30">
          <LayoutGrid className="w-12 h-12 text-slate-500 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Roadmap Yet</h3>
          <p className="text-slate-400 text-sm text-center max-w-md">
            Use the BuilderOS Architect on the Dashboard to generate your feature roadmap. 
            Once generated, your columns and cards will appear here.
          </p>
        </div>
      )}
    </div>
  );
}
