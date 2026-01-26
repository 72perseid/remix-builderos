import { useState, useMemo, useCallback } from 'react';
import { useArtifact } from '@/hooks/useArtifact';
import { 
  Loader2, LayoutGrid, Plus, MoreHorizontal, X,
  Users, Tag, CheckSquare, Calendar, Image, 
  ArrowRight, Copy, Trash2, AlignLeft, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Kanban, KanbanBoard, KanbanColumn, KanbanColumnContent, KanbanItem, KanbanOverlay } from '@/components/ui/kanban';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

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
  coverColor?: string;
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
const columnMapping: Record<string, string> = {
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

// Map card tags to target columns
const tagToColumnMapping: Record<string, string> = {
  'MVP': 'selected',
  'V1': 'backlog',
  'Stretch Goals': 'backlog'
};

// Label colors (Trello-style)
const labelColors: Record<string, { bg: string; hover: string }> = {
  MVP: { bg: '#4bce97', hover: '#7ee2b8' },
  V1: { bg: '#579dff', hover: '#85b8ff' },
  'Stretch Goals': { bg: '#9f8fef', hover: '#b8acf6' },
  high: { bg: '#f87168', hover: '#fd9891' },
  medium: { bg: '#f5cd47', hover: '#f8e6a0' },
  low: { bg: '#4bce97', hover: '#7ee2b8' }
};

// Trello-style Task Card
interface TaskCardProps {
  card: KanbanCard;
  isOverlay?: boolean;
  onClick?: () => void;
}

function TaskCard({ card, isOverlay, onClick }: TaskCardProps) {
  const labels = [card.tag, card.priority].filter(Boolean);
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-[#22272b] rounded-lg cursor-pointer transition-all border border-white/5",
        isOverlay 
          ? "shadow-2xl rotate-2 scale-105" 
          : "hover:bg-[#282e33] hover:border-white/10 hover:shadow-lg"
      )}
    >
      {/* Cover Color */}
      {card.coverColor && (
        <div 
          className="h-8 rounded-t-lg" 
          style={{ backgroundColor: card.coverColor }}
        />
      )}
      
      <div className="p-2">
        {/* Labels - small colored pills */}
        {labels.length > 0 && (
          <div className="flex gap-1 mb-2 flex-wrap">
            {labels.map((label, idx) => (
              <div
                key={idx}
                className="h-2 w-10 rounded-sm transition-all hover:h-4 group"
                style={{ backgroundColor: labelColors[label as string]?.bg || '#596773' }}
                title={label}
              />
            ))}
          </div>
        )}
        
        {/* Title */}
        <h4 className="text-sm font-normal text-[#b6c2cf] leading-5 mb-1">
          {card.title}
        </h4>
        
        {/* Description preview */}
        {card.description && (
          <p className="text-xs text-[#9fadbc] line-clamp-2 mb-2">
            {card.description}
          </p>
        )}
      </div>
    </div>
  );
}

// Trello-style Column
interface TaskColumnProps {
  columnId: string;
  title: string;
  cards: KanbanCard[];
  onAddCard: (columnId: string) => void;
  onEditCard: (card: KanbanCard, columnId: string) => void;
}

function TaskColumn({ columnId, title, cards, onAddCard, onEditCard }: TaskColumnProps) {
  return (
    <KanbanColumn 
      value={columnId} 
      className="flex-shrink-0 w-[272px] bg-black/25 backdrop-blur-sm rounded-xl border border-white/10 flex flex-col max-h-[calc(100vh-180px)]" 
      disabled
    >
      {/* Column Header */}
      <div className="p-2 px-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-[#b6c2cf] text-sm">{title}</h3>
          <button className="p-1 hover:bg-white/10 rounded transition-colors">
            <MoreHorizontal className="w-4 h-4 text-[#9fadbc]" />
          </button>
        </div>
      </div>

      {/* Cards */}
      <KanbanColumnContent value={columnId} className="flex-1 overflow-y-auto px-2 gap-2 pb-2">
        {cards.map(card => (
          <KanbanItem key={card.id} value={card.id} className="touch-none">
            <TaskCard 
              card={card} 
              onClick={() => onEditCard(card, columnId)}
            />
          </KanbanItem>
        ))}
      </KanbanColumnContent>

      {/* Add Card Button - Trello style */}
      <div className="p-2">
        <button 
          onClick={() => onAddCard(columnId)} 
          className="w-full py-1.5 px-2 hover:bg-white/10 text-[#9fadbc] hover:text-[#b6c2cf] rounded-lg text-sm transition-colors flex items-center gap-2 text-left"
        >
          <Plus className="w-4 h-4" />
          Add a card
        </button>
      </div>
    </KanbanColumn>
  );
}

// Trello-style Sidebar Button
interface SidebarButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  variant?: 'default' | 'danger';
}

function SidebarButton({ icon, label, onClick, variant = 'default' }: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors text-left",
        variant === 'danger' 
          ? "bg-[#a1bdd914] hover:bg-red-500/20 text-[#b6c2cf] hover:text-red-400"
          : "bg-[#a1bdd914] hover:bg-[#a6c5e229] text-[#9fadbc]"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

export default function ProjectBoardPage() {
  const { data: artifact, loading } = useArtifact('kanban');

  // Parse artifact content and build initial columns
  const initialColumns = useMemo(() => {
    const content = artifact?.content as ArtifactContent | null;
    const rawColumns = content?.columns || [];

    const columns: Record<string, KanbanCard[]> = {};
    COLUMN_CONFIG.forEach(config => {
      columns[config.id] = [];
    });

    rawColumns.forEach(oldCol => {
      const oldId = oldCol.id.toLowerCase();
      const columnIdMapping = columnMapping[oldId];
      
      oldCol.cards.forEach((card, index) => {
        let targetColumnId: string;
        if (card.tag && tagToColumnMapping[card.tag]) {
          targetColumnId = tagToColumnMapping[card.tag];
        } else if (columnIdMapping) {
          targetColumnId = columnIdMapping;
        } else {
          targetColumnId = 'backlog';
        }
        
        if (columns[targetColumnId]) {
          columns[targetColumnId].push({
            id: `${oldCol.id}-${index}`,
            tag: card.tag,
            title: card.title,
            description: card.description,
            priority: undefined,
            coverColor: undefined
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
  const [editingCardColumnId, setEditingCardColumnId] = useState<string | null>(null);
  const [newCardTitle, setNewCardTitle] = useState('');

  // Update columns when artifact changes
  useMemo(() => {
    if (Object.values(initialColumns).some(col => col.length > 0)) {
      setColumns(initialColumns);
    }
  }, [initialColumns]);

  const totalCards = Object.values(columns).reduce((acc, col) => acc + col.length, 0);

  const findCard = useCallback((id: string): KanbanCard | undefined => {
    for (const columnCards of Object.values(columns)) {
      const card = columnCards.find(c => c.id === id);
      if (card) return card;
    }
    return undefined;
  }, [columns]);

  const handleOpenAddDialog = useCallback((columnId: string) => {
    setActiveColumnId(columnId);
    setNewCardTitle('');
    setIsAddDialogOpen(true);
  }, []);

  const handleAddCard = useCallback(() => {
    if (!newCardTitle.trim() || !activeColumnId) return;
    
    const card: KanbanCard = {
      id: `card-${Date.now()}`,
      title: newCardTitle.trim(),
      description: '',
      tag: 'MVP',
      priority: undefined
    };
    
    setColumns(prev => ({
      ...prev,
      [activeColumnId]: [...(prev[activeColumnId] || []), card]
    }));
    
    setIsAddDialogOpen(false);
    setActiveColumnId(null);
    setNewCardTitle('');
  }, [newCardTitle, activeColumnId]);

  const handleEditCard = useCallback((card: KanbanCard, columnId: string) => {
    setEditingCard({ ...card });
    setEditingCardColumnId(columnId);
    setIsEditDialogOpen(true);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingCard) return;
    
    setColumns(prev => {
      const updated = { ...prev };
      for (const columnId of Object.keys(updated)) {
        const cardIndex = updated[columnId].findIndex(c => c.id === editingCard.id);
        if (cardIndex !== -1) {
          updated[columnId] = [
            ...updated[columnId].slice(0, cardIndex),
            editingCard,
            ...updated[columnId].slice(cardIndex + 1)
          ];
          break;
        }
      }
      return updated;
    });
    
    setIsEditDialogOpen(false);
    setEditingCard(null);
    setEditingCardColumnId(null);
  }, [editingCard]);

  const handleDeleteCard = useCallback(() => {
    if (!editingCard) return;
    
    setColumns(prev => {
      const updated = { ...prev };
      for (const columnId of Object.keys(updated)) {
        updated[columnId] = updated[columnId].filter(c => c.id !== editingCard.id);
      }
      return updated;
    });
    
    setIsEditDialogOpen(false);
    setEditingCard(null);
    setEditingCardColumnId(null);
  }, [editingCard]);

  const activeColumn = COLUMN_CONFIG.find(col => col.id === activeColumnId);
  const editingCardColumn = COLUMN_CONFIG.find(col => col.id === editingCardColumnId);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Kanban Board */}
      {totalCards > 0 ? (
        <Kanban<KanbanCard> value={columns} onValueChange={setColumns} getItemValue={item => item.id}>
          <KanbanBoard className="flex-1 gap-3">
            {COLUMN_CONFIG.map(config => (
              <TaskColumn
                key={config.id}
                columnId={config.id}
                title={config.title}
                cards={columns[config.id] || []}
                onAddCard={handleOpenAddDialog}
                onEditCard={handleEditCard}
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
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-white/10 bg-black/20 backdrop-blur-sm">
          <LayoutGrid className="w-12 h-12 text-white/30 mb-4" />
          <h3 className="text-lg font-semibold text-white/80 mb-2">No Tasks Yet</h3>
          <p className="text-white/50 text-sm text-center max-w-md">
            Use the BuilderOS Architect on the Dashboard to generate your feature roadmap.
            Once generated, your tasks will appear here organized by development stage.
          </p>
        </div>
      )}

      {/* Add Card Dialog - Simplified Trello-style */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#323940] border-none text-white sm:max-w-sm p-0 gap-0">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-[#9fadbc]">
                Add card to {activeColumn?.title}
              </span>
              <button 
                onClick={() => setIsAddDialogOpen(false)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4 text-[#9fadbc]" />
              </button>
            </div>
            <Textarea
              value={newCardTitle}
              onChange={e => setNewCardTitle(e.target.value)}
              placeholder="Enter a title for this card..."
              className="bg-[#22272b] border-none text-[#b6c2cf] placeholder:text-[#596773] min-h-[80px] resize-none focus-visible:ring-1 focus-visible:ring-[#579dff]"
              autoFocus
            />
            <div className="flex items-center gap-2 mt-3">
              <Button 
                onClick={handleAddCard} 
                disabled={!newCardTitle.trim()}
                className="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] font-medium"
                size="sm"
              >
                Add card
              </Button>
              <button 
                onClick={() => setIsAddDialogOpen(false)}
                className="p-2 hover:bg-white/10 rounded"
              >
                <X className="w-5 h-5 text-[#9fadbc]" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Card Dialog - Trello-style Two-Column Layout */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#323940] border-none text-white sm:max-w-3xl p-0 gap-0 max-h-[90vh] overflow-hidden">
          {editingCard && (
            <>
              {/* Cover Area */}
              {editingCard.coverColor && (
                <div 
                  className="h-24 w-full"
                  style={{ backgroundColor: editingCard.coverColor }}
                />
              )}
              
              <div className="p-6">
                {/* Header - Title */}
                <div className="flex items-start gap-3 mb-6">
                  <LayoutGrid className="w-6 h-6 text-[#9fadbc] mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <Input
                      value={editingCard.title}
                      onChange={e => setEditingCard({ ...editingCard, title: e.target.value })}
                      className="bg-transparent border-none text-xl font-semibold text-[#b6c2cf] p-0 h-auto focus-visible:ring-0 focus-visible:bg-[#22272b] rounded px-2 -mx-2"
                    />
                    <p className="text-sm text-[#9fadbc] mt-1">
                      in list <span className="underline">{editingCardColumn?.title}</span>
                    </p>
                  </div>
                  <button 
                    onClick={() => setIsEditDialogOpen(false)}
                    className="p-2 hover:bg-white/10 rounded"
                  >
                    <X className="w-5 h-5 text-[#9fadbc]" />
                  </button>
                </div>

                {/* Two Column Layout */}
                <div className="flex gap-4">
                  {/* Left Column - Main Content */}
                  <div className="flex-1 space-y-6">
                    {/* Labels Preview */}
                    {(editingCard.tag || editingCard.priority) && (
                      <div className="flex gap-1 flex-wrap">
                        {editingCard.tag && (
                          <span 
                            className="px-3 py-1 rounded text-xs font-medium text-[#1d2125]"
                            style={{ backgroundColor: labelColors[editingCard.tag]?.bg || '#596773' }}
                          >
                            {editingCard.tag}
                          </span>
                        )}
                        {editingCard.priority && (
                          <span 
                            className="px-3 py-1 rounded text-xs font-medium text-[#1d2125] capitalize"
                            style={{ backgroundColor: labelColors[editingCard.priority]?.bg || '#596773' }}
                          >
                            {editingCard.priority}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Description Section */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <AlignLeft className="w-5 h-5 text-[#9fadbc]" />
                        <h3 className="font-semibold text-[#b6c2cf]">Description</h3>
                      </div>
                      <Textarea
                        value={editingCard.description}
                        onChange={e => setEditingCard({ ...editingCard, description: e.target.value })}
                        placeholder="Add a more detailed description..."
                        className="bg-[#22272b] border-none text-[#b6c2cf] placeholder:text-[#596773] min-h-[120px] resize-none focus-visible:ring-1 focus-visible:ring-[#579dff] ml-8"
                      />
                    </div>

                    {/* Activity Section */}
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <MessageSquare className="w-5 h-5 text-[#9fadbc]" />
                        <h3 className="font-semibold text-[#b6c2cf]">Activity</h3>
                      </div>
                      <div className="flex items-start gap-3 ml-8">
                        <Avatar className="w-8 h-8">
                          <AvatarFallback className="bg-[#579dff] text-[#1d2125] text-xs">
                            U
                          </AvatarFallback>
                        </Avatar>
                        <Input
                          placeholder="Write a comment..."
                          className="bg-[#22272b] border-none text-[#b6c2cf] placeholder:text-[#596773] focus-visible:ring-1 focus-visible:ring-[#579dff]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Sidebar */}
                  <div className="w-[170px] space-y-4 flex-shrink-0">
                    {/* Add to card section */}
                    <div>
                      <p className="text-xs font-semibold text-[#9fadbc] mb-2 uppercase tracking-wide">
                        Add to card
                      </p>
                      <div className="space-y-1">
                        <SidebarButton icon={<Users className="w-4 h-4" />} label="Members" />
                        <SidebarButton icon={<Tag className="w-4 h-4" />} label="Labels" />
                        <SidebarButton icon={<CheckSquare className="w-4 h-4" />} label="Checklist" />
                        <SidebarButton icon={<Calendar className="w-4 h-4" />} label="Dates" />
                        <SidebarButton icon={<Image className="w-4 h-4" />} label="Cover" />
                      </div>
                    </div>

                    {/* Actions section */}
                    <div>
                      <p className="text-xs font-semibold text-[#9fadbc] mb-2 uppercase tracking-wide">
                        Actions
                      </p>
                      <div className="space-y-1">
                        <SidebarButton icon={<ArrowRight className="w-4 h-4" />} label="Move" />
                        <SidebarButton icon={<Copy className="w-4 h-4" />} label="Copy" />
                        <SidebarButton 
                          icon={<Trash2 className="w-4 h-4" />} 
                          label="Delete" 
                          variant="danger"
                          onClick={handleDeleteCard}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end mt-6 pt-4 border-t border-white/10">
                  <Button 
                    onClick={handleSaveEdit}
                    disabled={!editingCard.title.trim()}
                    className="bg-[#579dff] hover:bg-[#85b8ff] text-[#1d2125] font-medium"
                  >
                    Save Changes
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
