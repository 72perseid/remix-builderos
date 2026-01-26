import React, { useState, useMemo, useCallback } from 'react';
import { useArtifact } from '@/hooks/useArtifact';
import { Loader2, LayoutGrid, Plus, MoreHorizontal, X, CheckSquare, Calendar, ArrowRight, Trash2, AlignLeft, MessageSquare, ListTodo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Kanban, KanbanBoard, KanbanColumn, KanbanColumnContent, KanbanItem, KanbanOverlay } from '@/components/ui/kanban';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
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

// Task item interface for card tasks
interface TaskItem {
  id: string;
  text: string;
  done: boolean;
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
  tasks?: TaskItem[];
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
const labelColors: Record<string, {
  bg: string;
  hover: string;
}> = {
  MVP: {
    bg: '#10b981',
    hover: '#34d399'
  },
  V1: {
    bg: '#3b82f6',
    hover: '#60a5fa'
  },
  'Stretch Goals': {
    bg: '#8b5cf6',
    hover: '#a78bfa'
  },
  high: {
    bg: '#ef4444',
    hover: '#f87171'
  },
  medium: {
    bg: '#f59e0b',
    hover: '#fbbf24'
  },
  low: {
    bg: '#10b981',
    hover: '#34d399'
  }
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
function TaskCard({
  card,
  isOverlay,
  onClick
}: TaskCardProps) {
  const labels = [card.tag, card.priority].filter(Boolean);
  const checklist = card.checklist || [];
  const completedCount = checklist.filter(item => item.done).length;
  const totalCount = checklist.length;
  return <div onClick={onClick} className={cn("bg-[#1a2332] rounded-lg cursor-pointer transition-all border border-slate-700/50", isOverlay ? "shadow-2xl rotate-2 scale-105" : "hover:bg-[#1e2940] hover:border-slate-600 hover:shadow-lg")}>
      {/* Cover Color */}
      {card.coverColor && <div className="h-8 rounded-t-lg" style={{
      backgroundColor: card.coverColor
    }} />}
      
      <div className="p-2">
        {/* Labels - small colored pills */}
        {labels.length > 0 && <div className="flex gap-1 mb-2 flex-wrap">
            {labels.map((label, idx) => <div key={idx} className="h-2 w-10 rounded-sm transition-all hover:h-4 group" style={{
          backgroundColor: labelColors[label as string]?.bg || '#596773'
        }} title={label} />)}
          </div>}
        
        {/* Title */}
        <h4 className="text-sm font-normal text-[#b6c2cf] leading-5 mb-1">
          {card.title}
        </h4>
        
        {/* Description preview */}
        {card.description && <p className="text-xs text-[#9fadbc] line-clamp-2 mb-2">
            {card.description}
          </p>}
        
        {/* Badges Row - Deadline & Acceptance Criteria */}
        {(card.plannedDate || totalCount > 0) && <div className="flex items-center gap-2 flex-wrap">
            {/* Deadline Badge */}
            {card.plannedDate && <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium border", getDeadlineBadgeStyle(card.plannedDate, false))}>
                <Calendar className="w-3 h-3" />
                {format(new Date(card.plannedDate), 'MMM d')}
              </span>}
            
            {/* Acceptance Criteria Progress Badge */}
            {totalCount > 0 && <span className={cn("inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded font-medium border", completedCount === totalCount ? "bg-green-500/20 text-green-400 border-green-500/40" : "bg-slate-600/30 text-slate-400 border-slate-500/30")}>
                <CheckSquare className="w-3 h-3" />
                {completedCount}/{totalCount}
              </span>}
          </div>}
      </div>
    </div>;
}

// Trello-style Column
interface TaskColumnProps {
  columnId: string;
  title: string;
  cards: KanbanCard[];
  onAddCard: (columnId: string) => void;
  onEditCard: (card: KanbanCard, columnId: string) => void;
}
function TaskColumn({
  columnId,
  title,
  cards,
  onAddCard,
  onEditCard
}: TaskColumnProps) {
  return <KanbanColumn value={columnId} className="flex-shrink-0 w-[272px] bg-[#161e2a]/80 backdrop-blur-sm rounded-xl border border-slate-700/50 flex flex-col max-h-[calc(100vh-180px)]" disabled>
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
        {cards.map(card => <KanbanItem key={card.id} value={card.id} className="touch-none">
            <TaskCard card={card} onClick={() => onEditCard(card, columnId)} />
          </KanbanItem>)}
      </KanbanColumnContent>

      {/* Add Card Button */}
      <div className="p-2">
        <button onClick={() => onAddCard(columnId)} className="w-full py-1.5 px-2 hover:bg-white/10 text-slate-400 hover:text-white rounded-lg text-sm transition-colors flex items-center gap-2 text-left">
          <Plus className="w-4 h-4" />
          Add a card
        </button>
      </div>
    </KanbanColumn>;
}

// Trello-style Sidebar Button with forwardRef for Popover support
interface SidebarButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  label: string;
  variant?: 'default' | 'danger';
  active?: boolean;
}
const SidebarButton = React.forwardRef<HTMLButtonElement, SidebarButtonProps>(({
  icon,
  label,
  onClick,
  variant = 'default',
  active,
  className,
  ...props
}, ref) => {
  return <button ref={ref} onClick={onClick} className={cn("w-full px-3 py-1.5 rounded text-sm font-medium flex items-center gap-2 transition-colors text-left", variant === 'danger' ? "bg-slate-700/50 hover:bg-red-500/20 text-slate-300 hover:text-red-400" : active ? "bg-primary/20 text-primary border border-primary/30" : "bg-slate-700/50 hover:bg-slate-600/50 text-slate-300", className)} {...props}>
        {icon}
        {label}
      </button>;
});
SidebarButton.displayName = 'SidebarButton';
export default function ProjectBoardPage() {
  const {
    data: artifact,
    loading
  } = useArtifact('kanban');

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

  // Tasks state
  const [showTasks, setShowTasks] = useState(false);
  const [newTaskText, setNewTaskText] = useState('');

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
    setEditingCard({
      ...card,
      checklist: card.checklist || []
    });
    setEditingCardColumnId(columnId);
    setShowAcceptanceCriteria(false);
    setNewCriteriaText('');
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
    setEditingCardColumnId(null);
    setShowAcceptanceCriteria(false);
    setShowTasks(false);
  }, [editingCard]);
  const handleDeleteCard = useCallback(() => {
    if (!editingCard) return;
    setColumns(prev => {
      const updated = {
        ...prev
      };
      for (const columnId of Object.keys(updated)) {
        updated[columnId] = updated[columnId].filter(c => c.id !== editingCard.id);
      }
      return updated;
    });
    setIsEditDialogOpen(false);
    setEditingCard(null);
    setEditingCardColumnId(null);
    setShowAcceptanceCriteria(false);
    setShowTasks(false);
  }, [editingCard]);

  // Move card to different column
  const handleMoveCard = useCallback((targetColumnId: string) => {
    if (!editingCard || !editingCardColumnId || targetColumnId === editingCardColumnId) return;
    
    setColumns(prev => {
      const updated = { ...prev };
      // Remove from current column
      updated[editingCardColumnId] = updated[editingCardColumnId].filter(c => c.id !== editingCard.id);
      // Add to target column
      updated[targetColumnId] = [...(updated[targetColumnId] || []), editingCard];
      return updated;
    });
    
    setEditingCardColumnId(targetColumnId);
  }, [editingCard, editingCardColumnId]);

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
      checklist: (editingCard.checklist || []).map(item => item.id === criteriaId ? {
        ...item,
        done: !item.done
      } : item)
    });
  }, [editingCard]);
  const handleDeleteCriteria = useCallback((criteriaId: string) => {
    if (!editingCard) return;
    setEditingCard({
      ...editingCard,
      checklist: (editingCard.checklist || []).filter(item => item.id !== criteriaId)
    });
  }, [editingCard]);

  // Task handlers
  const handleAddTask = useCallback(() => {
    if (!newTaskText.trim() || !editingCard) return;
    const newTask: TaskItem = {
      id: `task-${Date.now()}`,
      text: newTaskText.trim(),
      done: false
    };
    setEditingCard({
      ...editingCard,
      tasks: [...(editingCard.tasks || []), newTask]
    });
    setNewTaskText('');
  }, [newTaskText, editingCard]);
  
  const handleToggleTask = useCallback((taskId: string) => {
    if (!editingCard) return;
    setEditingCard({
      ...editingCard,
      tasks: (editingCard.tasks || []).map(item => item.id === taskId ? {
        ...item,
        done: !item.done
      } : item)
    });
  }, [editingCard]);
  
  const handleDeleteTask = useCallback((taskId: string) => {
    if (!editingCard) return;
    setEditingCard({
      ...editingCard,
      tasks: (editingCard.tasks || []).filter(item => item.id !== taskId)
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
  const progressPercent = totalCount > 0 ? completedCount / totalCount * 100 : 0;
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-white/50" />
      </div>;
  }
  return <div className="h-full flex flex-col">
      {/* Kanban Board */}
      {totalCards > 0 ? <Kanban<KanbanCard> value={columns} onValueChange={setColumns} getItemValue={item => item.id}>
          <KanbanBoard className="flex-1 gap-3">
            {COLUMN_CONFIG.map(config => <TaskColumn key={config.id} columnId={config.id} title={config.title} cards={columns[config.id] || []} onAddCard={handleOpenAddDialog} onEditCard={handleEditCard} />)}
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
          <h3 className="text-lg font-semibold text-white mb-2">No Tasks Yet</h3>
          <p className="text-slate-400 text-sm text-center max-w-md">
            Use the BuilderOS Architect on the Dashboard to generate your feature roadmap.
            Once generated, your tasks will appear here organized by development stage.
          </p>
        </div>)}

      {/* Add Card Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-[#161e2a] border-slate-700/50 text-white sm:max-w-sm p-0 gap-0">
          <div className="p-3">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-slate-400">
                Add card to {activeColumn?.title}
              </span>
              <button onClick={() => setIsAddDialogOpen(false)} className="p-1 hover:bg-white/10 rounded">
                <X className="w-4 h-4 text-slate-400" />
              </button>
            </div>
            <Textarea value={newCardTitle} onChange={e => setNewCardTitle(e.target.value)} placeholder="Enter a title for this card..." className="bg-[#1a2332] border-slate-700/50 text-white placeholder:text-slate-500 min-h-[80px] resize-none focus-visible:ring-1 focus-visible:ring-primary" autoFocus />
            <div className="flex items-center gap-2 mt-3">
              <Button onClick={handleAddCard} disabled={!newCardTitle.trim()} className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium" size="sm">
                Add card
              </Button>
              <button onClick={() => setIsAddDialogOpen(false)} className="p-2 hover:bg-white/10 rounded">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Card Dialog - Refined Two-Column Layout */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-[#1a2332] border-slate-700/50 text-white sm:max-w-2xl p-0 gap-0 max-h-[85vh] overflow-hidden shadow-2xl [&>button]:hidden">
          {editingCard && <div className="flex flex-col max-h-[85vh]">
              {/* Header */}
              <div className="p-5 pb-4 border-b border-slate-700/30">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-700/50 flex items-center justify-center flex-shrink-0">
                    <LayoutGrid className="w-4 h-4 text-slate-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <Input value={editingCard.title} onChange={e => setEditingCard({
                  ...editingCard,
                  title: e.target.value
                })} className="bg-transparent border-none text-lg font-semibold text-white p-0 h-auto focus-visible:ring-0 hover:bg-slate-800/50 focus-visible:bg-slate-800/50 rounded px-2 -mx-2 py-1" />
                    <p className="text-xs text-slate-500 mt-0.5 px-2 -mx-2">
                      in list <span className="text-slate-400">{editingCardColumn?.title}</span>
                    </p>
                  </div>
                  <button onClick={() => setIsEditDialogOpen(false)} className="p-1.5 hover:bg-slate-700/50 rounded-lg transition-colors">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                </div>

                {/* Labels Preview (read-only) */}
                {(editingCard.tag || editingCard.priority) && <div className="flex gap-1.5 flex-wrap mt-3 ml-11">
                    {editingCard.tag && <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-white/90" style={{
                backgroundColor: labelColors[editingCard.tag]?.bg || '#596773'
              }}>
                        {editingCard.tag}
                      </span>}
                    {editingCard.priority && <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold text-white/90 capitalize" style={{
                backgroundColor: labelColors[editingCard.priority]?.bg || '#596773'
              }}>
                        {editingCard.priority}
                      </span>}
                  </div>}
              </div>

              {/* Body - Scrollable */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex gap-5 p-5">
                  {/* Left Column - Main Content */}
                  <div className="flex-1 space-y-5 min-w-0">
                    {/* Description Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <AlignLeft className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-medium text-slate-300">Description</span>
                      </div>
                      <Textarea value={editingCard.description} onChange={e => setEditingCard({
                    ...editingCard,
                    description: e.target.value
                  })} placeholder="Add a more detailed description..." className="bg-slate-800/50 border-slate-700/50 text-slate-200 placeholder:text-slate-500 min-h-[100px] resize-none focus-visible:ring-1 focus-visible:ring-primary/50 focus-visible:border-primary/50 text-sm rounded-lg" />
                    </div>

                    {/* Tasks Section - Always visible */}
                    {(() => {
                      const tasks = editingCard.tasks || [];
                      const completedTasks = tasks.filter(t => t.done).length;
                      const totalTasks = tasks.length;
                      const tasksProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
                      
                      return (
                        <div className="bg-[#161e2a] rounded-xl p-5 border border-slate-700/30">
                          {/* Header with title and progress */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1 max-w-[60%]">
                              <h3 className="text-xl font-semibold text-white">Tasks</h3>
                              <p className="text-sm text-slate-500 mt-1">
                                Small chunks of work that contribute to this card's objectives.
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="text-sm font-medium text-slate-300">
                                {Math.round(tasksProgress)}%
                              </span>
                              <div className="w-32 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                                <div 
                                  className="h-full transition-all duration-300 rounded-full bg-green-500"
                                  style={{ width: `${tasksProgress}%` }}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Tasks List */}
                          <div className="space-y-3">
                            {tasks.map(task => (
                              <div 
                                key={task.id} 
                                className="flex items-center gap-4 group"
                              >
                                <Checkbox 
                                  checked={task.done} 
                                  onCheckedChange={() => handleToggleTask(task.id)} 
                                  className="h-6 w-6 rounded-md border-2 border-slate-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" 
                                />
                                <span className={cn(
                                  "flex-1 text-base transition-colors",
                                  task.done ? "text-slate-500 line-through" : "text-white"
                                )}>
                                  {task.text}
                                </span>
                                <button 
                                  onClick={() => handleDeleteTask(task.id)} 
                                  className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all"
                                >
                                  <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-400" />
                                </button>
                              </div>
                            ))}
                          </div>

                          {/* Add Task Button */}
                          <div className="flex justify-end mt-5">
                            <Popover>
                              <PopoverTrigger asChild>
                                <button className="flex items-center gap-1.5 bg-slate-700/60 hover:bg-slate-700/80 text-primary px-4 py-2.5 rounded-full text-sm font-medium transition-colors">
                                  <Plus className="w-4 h-4" />
                                  Add item
                                </button>
                              </PopoverTrigger>
                              <PopoverContent className="w-72 p-3 bg-[#1a2332] border-slate-700" side="top" align="end">
                                <div className="space-y-2">
                                  <Input 
                                    value={newTaskText} 
                                    onChange={e => setNewTaskText(e.target.value)} 
                                    placeholder="Enter task..." 
                                    className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500" 
                                    onKeyDown={e => {
                                      if (e.key === 'Enter' && newTaskText.trim()) {
                                        e.preventDefault();
                                        handleAddTask();
                                      }
                                    }}
                                    autoFocus
                                  />
                                  <Button 
                                    onClick={handleAddTask}
                                    disabled={!newTaskText.trim()}
                                    size="sm"
                                    className="w-full"
                                  >
                                    Add Task
                                  </Button>
                                </div>
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Acceptance Criteria Section - Always visible */}
                    <div className="bg-[#161e2a] rounded-xl p-5 border border-slate-700/30">
                      {/* Header with title and progress */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1 max-w-[60%]">
                          <h3 className="text-xl font-semibold text-white">Acceptance criteria</h3>
                          <p className="text-sm text-slate-500 mt-1">
                            Describe what needs to work for this card to be marked as complete.
                          </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-sm font-medium text-slate-300">
                            {Math.round(progressPercent)}%
                          </span>
                          <div className="w-32 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
                            <div 
                              className="h-full transition-all duration-300 rounded-full bg-green-500"
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Criteria List */}
                      <div className="space-y-3">
                        {checklist.map(item => (
                          <div 
                            key={item.id} 
                            className="flex items-center gap-4 group"
                          >
                            <Checkbox 
                              checked={item.done} 
                              onCheckedChange={() => handleToggleCriteria(item.id)} 
                              className="h-6 w-6 rounded-md border-2 border-slate-500 data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500" 
                            />
                            <span className={cn(
                              "flex-1 text-base transition-colors",
                              item.done ? "text-slate-500 line-through" : "text-white"
                            )}>
                              {item.text}
                            </span>
                            <button 
                              onClick={() => handleDeleteCriteria(item.id)} 
                              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-red-500/20 transition-all"
                            >
                              <Trash2 className="w-4 h-4 text-slate-500 hover:text-red-400" />
                            </button>
                          </div>
                        ))}
                      </div>

                      {/* Add Criteria Button */}
                      <div className="flex justify-end mt-5">
                        <Popover>
                          <PopoverTrigger asChild>
                            <button className="flex items-center gap-1.5 bg-slate-700/60 hover:bg-slate-700/80 text-primary px-4 py-2.5 rounded-full text-sm font-medium transition-colors">
                              <Plus className="w-4 h-4" />
                              Add item
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="w-72 p-3 bg-[#1a2332] border-slate-700" side="top" align="end">
                            <div className="space-y-2">
                              <Input 
                                value={newCriteriaText} 
                                onChange={e => setNewCriteriaText(e.target.value)} 
                                placeholder="Enter criterion..." 
                                className="bg-slate-800/50 border-slate-600 text-white placeholder:text-slate-500" 
                                onKeyDown={e => {
                                  if (e.key === 'Enter' && newCriteriaText.trim()) {
                                    e.preventDefault();
                                    handleAddCriteria();
                                  }
                                }}
                                autoFocus
                              />
                              <Button 
                                onClick={handleAddCriteria}
                                disabled={!newCriteriaText.trim()}
                                size="sm"
                                className="w-full"
                              >
                                Add Criterion
                              </Button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                  </div>

                  {/* Right Column - Sidebar */}
                  <div className="w-40 space-y-4 flex-shrink-0">
                    {/* Add to card section */}
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Add to card
                      </p>
                      <div className="space-y-1">
                        <Popover open={isDeadlineOpen} onOpenChange={setIsDeadlineOpen}>
                          <PopoverTrigger asChild>
                            <SidebarButton icon={<Calendar className="w-3.5 h-3.5" />} label={editingCard.plannedDate ? format(new Date(editingCard.plannedDate), 'MMM d') : "Deadline"} active={!!editingCard.plannedDate} />
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0 bg-[#1a2332] border-slate-700 z-[100] shadow-xl" side="left" align="start" sideOffset={8}>
                            <CalendarComponent mode="single" selected={editingCard.plannedDate ? new Date(editingCard.plannedDate) : undefined} onSelect={handleSetDeadline} initialFocus className="p-3 pointer-events-auto" />
                            {editingCard.plannedDate && <div className="p-2 border-t border-slate-700">
                                <Button variant="ghost" size="sm" className="w-full text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs" onClick={() => handleSetDeadline(undefined)}>
                                  Remove deadline
                                </Button>
                              </div>}
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Actions section */}
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">
                        Actions
                      </p>
                      <div className="space-y-1">
                        <Popover>
                          <PopoverTrigger asChild>
                            <SidebarButton icon={<ArrowRight className="w-3.5 h-3.5" />} label="Move" />
                          </PopoverTrigger>
                          <PopoverContent className="w-48 p-2 bg-[#1a2332] border-slate-700 z-[100]" side="left" align="start" sideOffset={8}>
                            <p className="text-xs font-semibold text-slate-400 mb-2 px-2">Move to</p>
                            <div className="space-y-0.5">
                              {COLUMN_CONFIG.map(col => (
                                <button
                                  key={col.id}
                                  onClick={() => handleMoveCard(col.id)}
                                  disabled={col.id === editingCardColumnId}
                                  className={cn(
                                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors text-left",
                                    col.id === editingCardColumnId 
                                      ? "bg-slate-700/50 text-slate-500 cursor-not-allowed" 
                                      : "text-slate-300 hover:bg-slate-700/50 hover:text-white"
                                  )}
                                >
                                  <div 
                                    className="w-2 h-2 rounded-full flex-shrink-0" 
                                    style={{ backgroundColor: col.color }}
                                  />
                                  <span className="truncate">{col.title}</span>
                                  {col.id === editingCardColumnId && (
                                    <span className="text-[10px] text-slate-500 ml-auto">(current)</span>
                                  )}
                                </button>
                              ))}
                            </div>
                          </PopoverContent>
                        </Popover>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <SidebarButton icon={<Trash2 className="w-3.5 h-3.5" />} label="Delete" variant="danger" />
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-[#1a2332] border-slate-700">
                            <AlertDialogHeader>
                              <AlertDialogTitle className="text-slate-100">Delete this card?</AlertDialogTitle>
                              <AlertDialogDescription className="text-slate-400">
                                This action cannot be undone. This will permanently delete the card and all its data.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel className="bg-slate-700 border-slate-600 text-slate-200 hover:bg-slate-600 hover:text-white">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleDeleteCard}
                                className="bg-red-600 text-white hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end p-4 border-t border-slate-700/30 bg-slate-800/20">
                <Button onClick={handleSaveEdit} disabled={!editingCard.title.trim()} size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground font-medium px-5">
                  Save Changes
                </Button>
              </div>
            </div>}
        </DialogContent>
      </Dialog>
    </div>;
}