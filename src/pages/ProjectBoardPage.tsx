import { useState, useMemo, useCallback } from 'react';
import { useArtifact } from '@/hooks/useArtifact';
import { 
  Loader2, LayoutGrid, Plus, MoreHorizontal, X,
  CheckSquare, Calendar, ArrowRight, Trash2, AlignLeft, MessageSquare
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Kanban, KanbanBoard, KanbanColumn, KanbanColumnContent, KanbanItem, KanbanOverlay } from '@/components/ui/kanban';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { AcceptanceCriteriaItem } from '@/types';

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
  plannedDate?: string;
  checklist?: AcceptanceCriteriaItem[];
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

// Label colors (matching app theme)
const labelColors: Record<string, { bg: string; hover: string }> = {
  MVP: { bg: '#10b981', hover: '#34d399' },
  V1: { bg: '#3b82f6', hover: '#60a5fa' },
  'Stretch Goals': { bg: '#8b5cf6', hover: '#a78bfa' },
  high: { bg: '#ef4444', hover: '#f87171' },
  medium: { bg: '#f59e0b', hover: '#fbbf24' },
  low: { bg: '#10b981', hover: '#34d399' }
};

// Get deadline badge color based on urgency
function getDeadlineBadgeStyle(plannedDate: string, isDone: boolean) {
  if (isDone) {
    return 'bg-slate-600/30 text-slate-400 border-slate-500/30';
  }
  
  const date = new Date(plannedDate);
  const today = new Date();
  
  if (isPast(date) && !isToday(date)) {
    // Overdue - red
    return 'bg-red-500/20 text-red-400 border-red-500/40';
  }
  
  const daysUntilDue = differenceInDays(date, today);
  if (daysUntilDue <= 3) {
    // Due soon - yellow
    return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
  }
  
  // Future - gray
  return 'bg-slate-600/30 text-slate-400 border-slate-500/30';
}

// Trello-style Task Card
interface TaskCardProps {
  card: KanbanCard;
  isOverlay?: boolean;
  onClick?: () => void;
}

function TaskCard({ card, isOverlay, onClick }: TaskCardProps) {
  const labels = [card.tag, card.priority].filter(Boolean);
  const checklist = card.checklist || [];
  const completedCount = checklist.filter(item => item.done).length;
  const totalCount = checklist.length;
  
  return (
    <div 
      onClick={onClick}
      className={cn(
        "bg-[#1a2332] rounded-lg cursor-pointer transition-all border border-slate-700/50",
        isOverlay 
          ? "shadow-2xl rotate-2 scale-105" 
          : "hover:bg-[#1e2940] hover:border-slate-600 hover:shadow-lg"
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
        
        {/* Badges Row - Deadline & Acceptance Criteria */}
        {(card.plannedDate || totalCount > 0) && (
          <div className="flex items-center gap-2 flex-wrap">
            {/* Deadline Badge */}
            {card.plannedDate && (
              <span className={cn(
                "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium border",
                getDeadlineBadgeStyle(card.plannedDate, false)
              )}>
                <Calendar className="w-3 h-3" />
                {format(new Date(card.plannedDate), 'MMM d')}
              </span>
            )}
            
            {/* Acceptance Criteria Progress Badge */}
            {totalCount > 0 && (
              <span className={cn(
                "inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium border",
                completedCount === totalCount 
                  ? "bg-green-500/20 text-green-400 border-green-500/40"
                  : "bg-slate-600/30 text-slate-400 border-slate-500/30"
              )}>
                <CheckSquare className="w-3 h-3" />
                {completedCount}/{totalCount}
              </span>
            )}
          </div>
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
      className="flex-shrink-0 w-[272px] bg-[#161e2a]/80 backdrop-blur-sm rounded-xl border border-slate-700/50 flex flex-col max-h-[calc(100vh-180px)]" 
      disabled
    >
      {/* Column Header */}
      <div className="p-2 px-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">{title}</h3>
          <button className="p-1 hover:bg-white/10 rounded transition-colors">
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
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

      {/* Add Card Button */}
      <div className="p-2">
        <button 
          onClick={() => onAddCard(columnId)} 
          className="w-full py-1.5 px-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-sm transition-colors flex items-center gap-2 text-left"
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
  active?: boolean;
}

function SidebarButton({ icon, label, onClick, variant = 'default', active }: SidebarButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors text-left",
        variant === 'danger' 
          ? "bg-slate-700/50 hover:bg-red-500/20 text-slate-300 hover:text-red-400"
          : active
            ? "bg-primary/20 text-primary border border-primary/30"
            : "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300"
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
            coverColor: undefined,
            plannedDate: undefined,
            checklist: []
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
  
  // Acceptance Criteria state
  const [showAcceptanceCriteria, setShowAcceptanceCriteria] = useState(false);
  const [newCriteriaText, setNewCriteriaText] = useState('');
  
  // Deadline picker state
  const [isDeadlineOpen, setIsDeadlineOpen] = useState(false);

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
      priority: undefined,
      plannedDate: undefined,
      checklist: []
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
    setEditingCard({ ...card, checklist: card.checklist || [] });
    setEditingCardColumnId(columnId);
    setShowAcceptanceCriteria(false);
    setNewCriteriaText('');
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
    setShowAcceptanceCriteria(false);
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
    setShowAcceptanceCriteria(false);
  }, [editingCard]);

  // Acceptance Criteria handlers
  const handleAddCriteria = useCallback(() => {
    if (!newCriteriaText.trim() || !editingCard) return;
    
    const newItem: AcceptanceCriteriaItem = {
      id: `ac-${Date.now()}`,
      text: newCriteriaText.trim(),
      done: false
    };
    
    setEditingCard({
      ...editingCard,
      checklist: [...(editingCard.checklist || []), newItem]
    });
    setNewCriteriaText('');
  }, [newCriteriaText, editingCard]);

  const handleToggleCriteria = useCallback((criteriaId: string) => {
    if (!editingCard) return;
    
    setEditingCard({
      ...editingCard,
      checklist: (editingCard.checklist || []).map(item =>
        item.id === criteriaId ? { ...item, done: !item.done } : item
      )
    });
  }, [editingCard]);

  const handleDeleteCriteria = useCallback((criteriaId: string) => {
    if (!editingCard) return;
    
    setEditingCard({
      ...editingCard,
      checklist: (editingCard.checklist || []).filter(item => item.id !== criteriaId)
    });
  }, [editingCard]);

  // Deadline handler
  const handleSetDeadline = useCallback((date: Date | undefined) => {
    if (!editingCard) return;
    
    setEditingCard({
      ...editingCard,
      plannedDate: date ? format(date, 'yyyy-MM-dd') : undefined
    });
    setIsDeadlineOpen(false);
  }, [editingCard]);

  const activeColumn = COLUMN_CONFIG.find(col => col.id === activeColumnId);
  const editingCardColumn = COLUMN_CONFIG.find(col => col.id === editingCardColumnId);

  // Calculate acceptance criteria progress
  const checklist = editingCard?.checklist || [];
  const completedCount = checklist.filter(item => item.done).length;
  const totalCount = checklist.length;
  const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

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
        <div className="flex flex-col items-center justify-center py-16 px-4 rounded-xl border border-slate-700/50 bg-[#161e2a]/80">
          <LayoutGrid className="w-12 h-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">No Tasks Yet</h3>
          <p className="text-slate-400 text-sm text-center max-w-md">
            Use the BuilderOS Architect on the Dashboard to generate your feature roadmap.
            Once generated, your tasks will appear here organized by development stage.
          </p>
        </div>
      )}

      {/* Add Card Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#161e2a] border-slate-700/50 text-white sm:max-w-sm p-0 gap-0">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">
                Add card to {activeColumn?.title}
              </span>
              <button 
                onClick={() => setIsAddDialogOpen(false)}
                className="p-1 hover:bg-white/10 rounded"
              >
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <Textarea
              value={newCardTitle}
              onChange={e => setNewCardTitle(e.target.value)}
              placeholder="Enter a title for this card..."
              className="bg-[#1a2332] border-slate-700/50 text-white placeholder:text-slate-500 min-h-[80px] resize-none focus-visible:ring-1 focus-visible:ring-primary"
              autoFocus
            />
            <div className="flex items-center gap-2 mt-3">
              <Button 
                onClick={handleAddCard} 
                disabled={!newCardTitle.trim()}
                className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                size="sm"
              >
                Add card
              </Button>
              <button 
                onClick={() => setIsAddDialogOpen(false)}
                className="p-2 hover:bg-white/10 rounded"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Card Dialog - Simplified Two-Column Layout */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#161e2a] border-slate-700/50 text-white sm:max-w-3xl p-0 gap-0 max-h-[90vh] overflow-hidden">
          {editingCard && (
            <div className="p-6">
              {/* Header - Title */}
              <div className="flex items-start gap-3 mb-6">
                <LayoutGrid className="w-6 h-6 text-slate-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <Input
                    value={editingCard.title}
                    onChange={e => setEditingCard({ ...editingCard, title: e.target.value })}
                    className="bg-transparent border-none text-xl font-semibold text-white p-0 h-auto focus-visible:ring-0 focus-visible:bg-[#1a2332] rounded px-2 -mx-2"
                  />
                  <p className="text-sm text-slate-400 mt-1">
                    in list <span className="underline">{editingCardColumn?.title}</span>
                  </p>
                </div>
                <button 
                  onClick={() => setIsEditDialogOpen(false)}
                  className="p-2 hover:bg-white/10 rounded"
                >
                  <X className="w-5 h-5 text-slate-400" />
                </button>
              </div>

              {/* Two Column Layout */}
              <div className="flex gap-4">
                {/* Left Column - Main Content */}
                <div className="flex-1 space-y-6">
                  {/* Labels Preview (read-only) */}
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
                      <AlignLeft className="w-5 h-5 text-slate-400" />
                      <h3 className="font-semibold text-white">Description</h3>
                    </div>
                    <Textarea
                      value={editingCard.description}
                      onChange={e => setEditingCard({ ...editingCard, description: e.target.value })}
                      placeholder="Add a more detailed description..."
                      className="bg-[#1a2332] border-slate-700/50 text-white placeholder:text-slate-500 min-h-[120px] resize-none focus-visible:ring-1 focus-visible:ring-primary ml-8"
                    />
                  </div>

                  {/* Acceptance Criteria Section */}
                  {showAcceptanceCriteria && (
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <CheckSquare className="w-5 h-5 text-slate-400" />
                        <h3 className="font-semibold text-white">Acceptance Criteria</h3>
                        {totalCount > 0 && (
                          <span className={cn(
                            "text-xs px-2 py-0.5 rounded",
                            completedCount === totalCount
                              ? "bg-green-500/20 text-green-400"
                              : "bg-slate-700 text-slate-400"
                          )}>
                            {completedCount}/{totalCount} passed
                          </span>
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      {totalCount > 0 && (
                        <div className="ml-8 mb-3">
                          <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className={cn(
                                "h-full transition-all duration-300",
                                completedCount === totalCount ? "bg-green-500" : "bg-primary"
                              )}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      )}

                      {/* Criteria List */}
                      <div className="ml-8 space-y-2">
                        {checklist.map(item => (
                          <div 
                            key={item.id} 
                            className="flex items-center gap-3 group p-2 rounded hover:bg-[#1a2332] -mx-2"
                          >
                            <Checkbox 
                              checked={item.done}
                              onCheckedChange={() => handleToggleCriteria(item.id)}
                              className="border-slate-500 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                            />
                            <span className={cn(
                              "flex-1 text-sm",
                              item.done ? "text-slate-500 line-through" : "text-slate-300"
                            )}>
                              {item.text}
                            </span>
                            <button
                              onClick={() => handleDeleteCriteria(item.id)}
                              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-500/20 rounded transition-all"
                            >
                              <X className="w-3 h-3 text-slate-400 hover:text-red-400" />
                            </button>
                          </div>
                        ))}

                        {/* Add New Criteria Input */}
                        <div className="flex items-center gap-2">
                          <Input
                            value={newCriteriaText}
                            onChange={e => setNewCriteriaText(e.target.value)}
                            placeholder="Add an item..."
                            className="bg-[#1a2332] border-slate-700/50 text-white placeholder:text-slate-500 text-sm h-9 focus-visible:ring-1 focus-visible:ring-primary"
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddCriteria();
                              }
                            }}
                          />
                          <Button
                            onClick={handleAddCriteria}
                            disabled={!newCriteriaText.trim()}
                            size="sm"
                            className="bg-primary hover:bg-primary/90 text-primary-foreground"
                          >
                            Add
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Activity Section */}
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <MessageSquare className="w-5 h-5 text-slate-400" />
                      <h3 className="font-semibold text-white">Activity</h3>
                    </div>
                    <div className="flex items-start gap-3 ml-8">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          U
                        </AvatarFallback>
                      </Avatar>
                      <Input
                        placeholder="Write a comment..."
                        className="bg-[#1a2332] border-slate-700/50 text-white placeholder:text-slate-500 focus-visible:ring-1 focus-visible:ring-primary"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column - Sidebar */}
                <div className="w-[170px] space-y-4 flex-shrink-0">
                  {/* Add to card section */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                      Add to card
                    </p>
                    <div className="space-y-1">
                      <SidebarButton 
                        icon={<CheckSquare className="w-4 h-4" />} 
                        label="Acceptance Criteria"
                        active={showAcceptanceCriteria}
                        onClick={() => setShowAcceptanceCriteria(!showAcceptanceCriteria)}
                      />
                      <Popover open={isDeadlineOpen} onOpenChange={setIsDeadlineOpen}>
                        <PopoverTrigger asChild>
                          <div>
                            <SidebarButton 
                              icon={<Calendar className="w-4 h-4" />} 
                              label={editingCard.plannedDate 
                                ? format(new Date(editingCard.plannedDate), 'MMM d, yyyy')
                                : "Deadline"
                              }
                              active={!!editingCard.plannedDate}
                            />
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1a2332] border-slate-700" align="start">
                          <CalendarComponent
                            mode="single"
                            selected={editingCard.plannedDate ? new Date(editingCard.plannedDate) : undefined}
                            onSelect={handleSetDeadline}
                            initialFocus
                            className="p-3 pointer-events-auto"
                          />
                          {editingCard.plannedDate && (
                            <div className="p-2 border-t border-slate-700">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                onClick={() => handleSetDeadline(undefined)}
                              >
                                Remove deadline
                              </Button>
                            </div>
                          )}
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  {/* Actions section */}
                  <div>
                    <p className="text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                      Actions
                    </p>
                    <div className="space-y-1">
                      <SidebarButton icon={<ArrowRight className="w-4 h-4" />} label="Move" />
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
              <div className="flex justify-end mt-6 pt-4 border-t border-slate-700/50">
                <Button 
                  onClick={handleSaveEdit}
                  disabled={!editingCard.title.trim()}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
                >
                  Save Changes
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
