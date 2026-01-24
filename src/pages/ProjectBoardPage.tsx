import { useState, useMemo, useCallback } from 'react';
import { useArtifact } from '@/hooks/useArtifact';
import { Loader2, LayoutGrid, GripVertical, Plus, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Kanban, KanbanBoard, KanbanColumn, KanbanColumnContent, KanbanItem, KanbanOverlay } from '@/components/ui/kanban';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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
const COLUMN_CONFIG: {
  id: string;
  title: string;
  color: string;
}[] = [{
  id: 'backlog',
  title: 'Backlog',
  color: '#6B7280'
}, {
  id: 'selected',
  title: 'Selected for Development',
  color: '#3B82F6'
}, {
  id: 'in_progress',
  title: 'In Progress',
  color: '#8B5CF6'
}, {
  id: 'qa',
  title: 'In QA',
  color: '#F59E0B'
}, {
  id: 'done',
  title: 'Done',
  color: '#10B981'
}];

// Map old column IDs and tags to new column IDs
// Supports both column id-based mapping and tag-based mapping
const columnMapping: Record<string, string> = {
  // Column ID mappings
  'backlog': 'backlog',
  'todo': 'selected',
  'to-do': 'selected',
  'selected': 'selected',
  'mvp': 'selected',
  'v1': 'backlog',
  'in-progress': 'in_progress',
  'in_progress': 'in_progress',
  'review': 'qa',
  'qa': 'qa',
  'stretch': 'backlog',
  'stretch goals': 'backlog',
  'done': 'done'
};

// Map card tags to target columns (used when column ID isn't specific enough)
const tagToColumnMapping: Record<string, string> = {
  'MVP': 'selected',
  'V1': 'backlog',
  'Stretch Goals': 'backlog'
};

// Priority badge styling
const priorityStyles: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30'
};

// Tag badge styling
const tagStyles: Record<string, string> = {
  MVP: 'bg-green-500/20 text-green-400 border border-green-500/30',
  V1: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  'Stretch Goals': 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
};
interface TaskCardProps {
  card: KanbanCard;
  isOverlay?: boolean;
  onEdit?: (card: KanbanCard) => void;
  onDelete?: (cardId: string) => void;
}
function TaskCard({
  card,
  isOverlay,
  onEdit,
  onDelete
}: TaskCardProps) {
  return <div className={cn("bg-[#1a2332] border border-slate-700/50 rounded-lg p-3 transition-all group relative", isOverlay ? "shadow-2xl rotate-2 scale-105" : "hover:border-slate-600 cursor-grab active:cursor-grabbing")}>
      {/* Action buttons */}
      {!isOverlay && <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={e => {
        e.stopPropagation();
        onEdit?.(card);
      }} className="p-1 hover:bg-slate-700 rounded transition-colors">
            <Pencil className="w-3 h-3 text-slate-400" />
          </button>
          <button onClick={e => {
        e.stopPropagation();
        onDelete?.(card.id);
      }} className="p-1 hover:bg-red-900/30 rounded transition-colors">
            <Trash2 className="w-3 h-3 text-slate-400 hover:text-red-400" />
          </button>
        </div>}

      <div className="flex items-start gap-2">
        <GripVertical className="w-4 h-4 text-slate-600 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
        <div className="flex-1 min-w-0 pr-10">
          <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">
            {card.title}
          </h4>
          {card.description && <p className="text-xs text-slate-400 line-clamp-2 mb-2">
              {card.description}
            </p>}
          <div className="flex items-center gap-2 flex-wrap">
            {card.tag && <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium", tagStyles[card.tag] || "bg-slate-500/20 text-slate-400 border border-slate-500/30")}>
                {card.tag}
              </span>}
            {card.priority && <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium capitalize border", priorityStyles[card.priority])}>
                {card.priority}
              </span>}
          </div>
        </div>
      </div>
    </div>;
}
interface TaskColumnProps {
  columnId: string;
  title: string;
  color: string;
  cards: KanbanCard[];
  onAddCard: (columnId: string) => void;
  onEditCard: (card: KanbanCard) => void;
  onDeleteCard: (cardId: string) => void;
}
function TaskColumn({
  columnId,
  title,
  color,
  cards,
  onAddCard,
  onEditCard,
  onDeleteCard
}: TaskColumnProps) {
  return <KanbanColumn value={columnId} className="flex-shrink-0 w-72 bg-[#0f1729] rounded-lg border border-slate-700/50 flex flex-col max-h-[calc(100vh-220px)]" disabled>
      {/* Column Header */}
      <div className="p-3 bg-[#1a2744] rounded-t-lg border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-white text-sm">{title}</h3>
            <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white" style={{
            backgroundColor: color
          }}>
              {cards.length}
            </span>
          </div>
        </div>
      </div>

      {/* Cards */}
      <KanbanColumnContent value={columnId} className="flex-1 overflow-y-auto p-2 gap-2">
        {cards.map(card => <KanbanItem key={card.id} value={card.id} className="touch-none">
            <TaskCard card={card} onEdit={onEditCard} onDelete={onDeleteCard} />
          </KanbanItem>)}
      </KanbanColumnContent>

      {/* Add Card Button */}
      <div className="p-2 border-t border-slate-700/50">
        <button onClick={() => onAddCard(columnId)} className="w-full py-2 px-3 bg-[#1a2744] hover:bg-[#243352] text-slate-400 hover:text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          New card
        </button>
      </div>
    </KanbanColumn>;
}
export default function ProjectBoardPage() {
  const {
    data: artifact,
    loading
  } = useArtifact('kanban');

  // Parse artifact content and build initial columns
  const initialColumns = useMemo(() => {
    const content = artifact?.content as ArtifactContent | null;
    const rawColumns = content?.columns || [];

    // Initialize empty columns
    const columns: Record<string, KanbanCard[]> = {};
    COLUMN_CONFIG.forEach(config => {
      columns[config.id] = [];
    });

    // Distribute cards from old columns to new columns
    rawColumns.forEach(oldCol => {
      const oldId = oldCol.id.toLowerCase();
      // First check if the column ID itself maps to a specific column
      const columnIdMapping = columnMapping[oldId];
      oldCol.cards.forEach((card, index) => {
        // Determine target column: prioritize tag-based mapping, fallback to column ID mapping
        let targetColumnId: string;
        if (card.tag && tagToColumnMapping[card.tag]) {
          // Use tag-based mapping (MVP -> selected, V1 -> backlog, etc.)
          targetColumnId = tagToColumnMapping[card.tag];
        } else if (columnIdMapping) {
          // Fallback to column ID mapping
          targetColumnId = columnIdMapping;
        } else {
          // Default to backlog if no mapping found
          targetColumnId = 'backlog';
        }
        if (columns[targetColumnId]) {
          columns[targetColumnId].push({
            id: `${oldCol.id}-${index}`,
            tag: card.tag,
            title: card.title,
            description: card.description,
            priority: undefined
          });
        }
      });
    });
    return columns;
  }, [artifact]);
  const [columns, setColumns] = useState<Record<string, KanbanCard[]>>(initialColumns);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [newCard, setNewCard] = useState({
    title: '',
    description: '',
    tag: 'MVP',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

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
  const handleOpenAddDialog = useCallback((columnId: string) => {
    setActiveColumnId(columnId);
    setNewCard({
      title: '',
      description: '',
      tag: 'MVP',
      priority: 'medium'
    });
    setIsAddDialogOpen(true);
  }, []);
  const handleAddCard = useCallback(() => {
    if (!newCard.title.trim() || !activeColumnId) return;
    const card: KanbanCard = {
      id: `card-${Date.now()}`,
      title: newCard.title.trim(),
      description: newCard.description.trim(),
      tag: newCard.tag,
      priority: newCard.priority
    };
    setColumns(prev => ({
      ...prev,
      [activeColumnId]: [...(prev[activeColumnId] || []), card]
    }));
    setIsAddDialogOpen(false);
    setActiveColumnId(null);
  }, [newCard, activeColumnId]);
  const handleEditCard = useCallback((card: KanbanCard) => {
    setEditingCard(card);
    setIsEditDialogOpen(true);
  }, []);
  const handleSaveEdit = useCallback(() => {
    if (!editingCard) return;
    setColumns(prev => {
      const updated = {
        ...prev
      };
      for (const columnId of Object.keys(updated)) {
        const cardIndex = updated[columnId].findIndex(c => c.id === editingCard.id);
        if (cardIndex !== -1) {
          updated[columnId] = [...updated[columnId].slice(0, cardIndex), editingCard, ...updated[columnId].slice(cardIndex + 1)];
          break;
        }
      }
      return updated;
    });
    setIsEditDialogOpen(false);
    setEditingCard(null);
  }, [editingCard]);
  const handleDeleteCard = useCallback((cardId: string) => {
    setColumns(prev => {
      const updated = {
        ...prev
      };
      for (const columnId of Object.keys(updated)) {
        updated[columnId] = updated[columnId].filter(c => c.id !== cardId);
      }
      return updated;
    });
  }, []);
  const activeColumn = COLUMN_CONFIG.find(col => col.id === activeColumnId);
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <p className="text-primary-foreground">
          {totalCards > 0 ? `${totalCards} tasks across ${COLUMN_CONFIG.length} columns • Drag cards to move them` : 'Your tasks will appear here once generated'}
        </p>
      </div>

      {/* Kanban Board */}
      {totalCards > 0 ? <Kanban<KanbanCard> value={columns} onValueChange={setColumns} getItemValue={item => item.id}>
          <KanbanBoard className="flex-1">
            {COLUMN_CONFIG.map(config => <TaskColumn key={config.id} columnId={config.id} title={config.title} color={config.color} cards={columns[config.id] || []} onAddCard={handleOpenAddDialog} onEditCard={handleEditCard} onDeleteCard={handleDeleteCard} />)}
          </KanbanBoard>
          <KanbanOverlay>
            {({
          value
        }) => {
          const card = findCard(value as string);
          if (!card) return null;
          return <TaskCard card={card} isOverlay />;
        }}
          </KanbanOverlay>
        </Kanban> : (/* Empty State */
    <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-slate-700/50 bg-[#161e2a]/80">
          <LayoutGrid className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Tasks Yet</h3>
          <p className="text-muted-foreground text-sm text-center max-w-md">
            Use the BuilderOS Architect on the Dashboard to generate your feature roadmap.
            Once generated, your tasks will appear here organized by development stage.
          </p>
        </div>)}

      {/* Add Card Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#161e2a] border-slate-700/50 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">
              Add Card to {activeColumn?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300">Title</Label>
              <Input id="title" value={newCard.title} onChange={e => setNewCard({
              ...newCard,
              title: e.target.value
            })} placeholder="Enter card title" className="bg-[#1a2332] border-slate-700/50 text-white placeholder:text-slate-500" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">Description</Label>
              <Textarea id="description" value={newCard.description} onChange={e => setNewCard({
              ...newCard,
              description: e.target.value
            })} placeholder="Enter card description (optional)" className="bg-[#1a2332] border-slate-700/50 text-white placeholder:text-slate-500 min-h-[80px]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Tag</Label>
                <Select value={newCard.tag} onValueChange={value => setNewCard({
                ...newCard,
                tag: value
              })}>
                  <SelectTrigger className="bg-[#1a2332] border-slate-700/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-slate-700/50">
                    <SelectItem value="MVP" className="text-white hover:bg-white/10">MVP</SelectItem>
                    <SelectItem value="V1" className="text-white hover:bg-white/10">V1</SelectItem>
                    <SelectItem value="Stretch Goals" className="text-white hover:bg-white/10">Stretch Goals</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Priority</Label>
                <Select value={newCard.priority} onValueChange={(value: 'low' | 'medium' | 'high') => setNewCard({
                ...newCard,
                priority: value
              })}>
                  <SelectTrigger className="bg-[#1a2332] border-slate-700/50 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-slate-700/50">
                    <SelectItem value="low" className="text-white hover:bg-white/10">Low</SelectItem>
                    <SelectItem value="medium" className="text-white hover:bg-white/10">Medium</SelectItem>
                    <SelectItem value="high" className="text-white hover:bg-white/10">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="text-slate-400 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleAddCard} disabled={!newCard.title.trim()} className="bg-blue-600 hover:bg-blue-700">
              Add Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Card Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#161e2a] border-slate-700/50 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Card</DialogTitle>
          </DialogHeader>
          {editingCard && <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title" className="text-slate-300">Title</Label>
                <Input id="edit-title" value={editingCard.title} onChange={e => setEditingCard({
              ...editingCard,
              title: e.target.value
            })} placeholder="Enter card title" className="bg-[#1a2332] border-slate-700/50 text-white placeholder:text-slate-500" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description" className="text-slate-300">Description</Label>
                <Textarea id="edit-description" value={editingCard.description} onChange={e => setEditingCard({
              ...editingCard,
              description: e.target.value
            })} placeholder="Enter card description (optional)" className="bg-[#1a2332] border-slate-700/50 text-white placeholder:text-slate-500 min-h-[80px]" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-slate-300">Tag</Label>
                  <Select value={editingCard.tag} onValueChange={value => setEditingCard({
                ...editingCard,
                tag: value
              })}>
                    <SelectTrigger className="bg-[#1a2332] border-slate-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-slate-700/50">
                      <SelectItem value="MVP" className="text-white hover:bg-white/10">MVP</SelectItem>
                      <SelectItem value="V1" className="text-white hover:bg-white/10">V1</SelectItem>
                      <SelectItem value="Stretch Goals" className="text-white hover:bg-white/10">Stretch Goals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Priority</Label>
                  <Select value={editingCard.priority || 'medium'} onValueChange={(value: 'low' | 'medium' | 'high') => setEditingCard({
                ...editingCard,
                priority: value
              })}>
                    <SelectTrigger className="bg-[#1a2332] border-slate-700/50 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a2332] border-slate-700/50">
                      <SelectItem value="low" className="text-white hover:bg-white/10">Low</SelectItem>
                      <SelectItem value="medium" className="text-white hover:bg-white/10">Medium</SelectItem>
                      <SelectItem value="high" className="text-white hover:bg-white/10">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>}
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsEditDialogOpen(false)} className="text-slate-400 hover:text-white">
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editingCard?.title.trim()} className="bg-blue-600 hover:bg-blue-700">
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>;
}