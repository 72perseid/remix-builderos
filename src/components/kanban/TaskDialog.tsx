import { useEffect, useState } from 'react';
import { Task, TaskColor, TaskStatus, TaskPriority, ProjectTag } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useProjectTags, TAG_COLORS } from '@/hooks/useProjectTags';
import { X, Plus, Check, Trash2, Pencil } from 'lucide-react';
import { toast } from 'sonner';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultStatus?: TaskStatus;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => void;
}

const colors: { value: TaskColor; label: string; className: string }[] = [
  { value: 'yellow', label: 'Yellow', className: 'bg-yellow-400' },
  { value: 'coral', label: 'Coral', className: 'bg-orange-400' },
  { value: 'mint', label: 'Mint', className: 'bg-emerald-400' },
  { value: 'lavender', label: 'Lavender', className: 'bg-purple-400' },
  { value: 'sky', label: 'Sky', className: 'bg-blue-400' },
];

const statuses: { value: TaskStatus; label: string }[] = [
  { value: 'backlog', label: 'Backlog' },
  { value: 'selected', label: 'Selected for Development' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'qa', label: 'In QA' },
  { value: 'done', label: 'Done' },
];

const priorities: TaskPriority[] = ['low', 'medium', 'high'];

export function TaskDialog({
  open,
  onOpenChange,
  task,
  defaultStatus = 'backlog',
  onSave,
}: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState<TaskColor>('yellow');
  const [status, setStatus] = useState<TaskStatus>(defaultStatus);
  const [priority, setPriority] = useState<TaskPriority | ''>('');
  const [plannedDate, setPlannedDate] = useState('');
  const [estimatedEffort, setEstimatedEffort] = useState('');

  // Tag management state
  const [linkedTags, setLinkedTags] = useState<ProjectTag[]>([]);
  const [pendingLinks, setPendingLinks] = useState<string[]>([]);
  const [pendingUnlinks, setPendingUnlinks] = useState<string[]>([]);
  const [tagPopoverOpen, setTagPopoverOpen] = useState(false);
  const [createTagOpen, setCreateTagOpen] = useState(false);
  const [newTagLabel, setNewTagLabel] = useState('');
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);
  const [tagSearch, setTagSearch] = useState('');
  
  // Edit tag state
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [editTagLabel, setEditTagLabel] = useState('');
  const [editTagColor, setEditTagColor] = useState('');

  const { tags: projectTags, createTag, updateTag, deleteTag, linkTagToTask, unlinkTagFromTask, isCreating, isUpdating } = useProjectTags();

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setColor(task.color);
        setStatus(task.status);
        setPriority(task.priority || '');
        setPlannedDate(task.plannedDate || '');
        setEstimatedEffort(task.estimatedEffort || '');
        setLinkedTags(task.tags || []);
      } else {
        setTitle('');
        setDescription('');
        setColor('yellow');
        setStatus(defaultStatus);
        setPriority('');
        setPlannedDate('');
        setEstimatedEffort('');
        setLinkedTags([]);
      }
      // Reset pending changes
      setPendingLinks([]);
      setPendingUnlinks([]);
      setTagSearch('');
      setNewTagLabel('');
      setNewTagColor(TAG_COLORS[0]);
      setEditingTagId(null);
      setEditTagLabel('');
      setEditTagColor('');
    }
  }, [task, defaultStatus, open]);

  // Filter available tags (not already linked)
  const availableTags = projectTags.filter(
    pt => !linkedTags.some(lt => lt.id === pt.id) && 
    pt.label.toLowerCase().includes(tagSearch.toLowerCase())
  );

  const handleLinkTag = (tag: ProjectTag) => {
    setLinkedTags(prev => [...prev, tag]);
    if (task) {
      // Track for save - only if editing existing task
      setPendingLinks(prev => [...prev, tag.id]);
      setPendingUnlinks(prev => prev.filter(id => id !== tag.id));
    }
    setTagPopoverOpen(false);
    setTagSearch('');
  };

  const handleUnlinkTag = (tagId: string) => {
    setLinkedTags(prev => prev.filter(t => t.id !== tagId));
    if (task) {
      // Track for save - only if editing existing task
      setPendingUnlinks(prev => [...prev, tagId]);
      setPendingLinks(prev => prev.filter(id => id !== tagId));
    }
  };

  const handleCreateTag = async () => {
    if (!newTagLabel.trim()) return;

    try {
      const newTag = await createTag(newTagLabel.trim(), newTagColor);
      // Auto-link the new tag
      setLinkedTags(prev => [...prev, newTag]);
      if (task) {
        setPendingLinks(prev => [...prev, newTag.id]);
      }
      setNewTagLabel('');
      setNewTagColor(TAG_COLORS[0]);
      setCreateTagOpen(false);
      setTagPopoverOpen(false);
      toast.success('Tag created');
    } catch (error) {
      toast.error('Failed to create tag');
    }
  };

  const handleDeleteProjectTag = (tagId: string) => {
    deleteTag(tagId);
    // Remove from linked tags if present
    setLinkedTags(prev => prev.filter(t => t.id !== tagId));
    setEditingTagId(null);
    toast.success('Tag deleted');
  };

  const handleOpenEditTag = (tag: ProjectTag) => {
    setEditingTagId(tag.id);
    setEditTagLabel(tag.label);
    setEditTagColor(tag.color);
  };

  const handleSaveEditTag = async () => {
    if (!editingTagId || !editTagLabel.trim()) return;

    try {
      const updatedTag = await updateTag(editingTagId, editTagLabel.trim(), editTagColor);
      // Update in local state
      setLinkedTags(prev => prev.map(t => t.id === editingTagId ? updatedTag : t));
      setEditingTagId(null);
      toast.success('Tag updated');
    } catch (error) {
      toast.error('Failed to update tag');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      color,
      status,
      priority: priority || undefined,
      plannedDate: plannedDate || undefined,
      estimatedEffort: estimatedEffort || undefined,
      completedDate: task?.completedDate,
    });

    // Process tag links/unlinks if editing existing task
    if (task) {
      try {
        for (const tagId of pendingLinks) {
          await linkTagToTask(task.id, tagId);
        }
        for (const tagId of pendingUnlinks) {
          await unlinkTagFromTask(task.id, tagId);
        }
      } catch (error) {
        console.error('Error updating tags:', error);
      }
    }

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0f1729] border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-300">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
              className="bg-[#1a2744] border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={3}
              className="bg-[#1a2744] border-slate-600 text-white placeholder:text-slate-500"
            />
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <Label className="text-slate-300">Tags</Label>
            <div className="flex flex-wrap gap-2 items-center">
              {/* Linked tags with edit popover */}
              {linkedTags.map(tag => (
                <div key={tag.id} className="inline-flex items-center">
                  <Popover 
                    open={editingTagId === tag.id} 
                    onOpenChange={(open) => {
                      if (open) {
                        handleOpenEditTag(tag);
                      } else {
                        setEditingTagId(null);
                      }
                    }}
                  >
                    <PopoverTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-l font-medium cursor-pointer hover:opacity-80 transition-opacity"
                        style={{
                          backgroundColor: `${tag.color}20`,
                          color: tag.color,
                          border: `1px solid ${tag.color}40`,
                          borderRight: 'none'
                        }}
                      >
                        <Pencil className="h-3 w-3" />
                        <span>{tag.label}</span>
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="z-[9999] w-64 p-3 bg-[#1a2744] border-slate-600" align="start">
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-white font-medium">Edit Tag</span>
                          <button
                            type="button"
                            onClick={() => setEditingTagId(null)}
                            className="text-slate-400 hover:text-white"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">Label</Label>
                          <Input
                            value={editTagLabel}
                            onChange={(e) => setEditTagLabel(e.target.value)}
                            placeholder="Tag name..."
                            className="h-8 bg-[#0f1729] border-slate-600 text-white text-sm placeholder:text-slate-500"
                            autoFocus
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label className="text-xs text-slate-400">Color</Label>
                          <div className="flex flex-wrap gap-1.5">
                            {TAG_COLORS.map(c => (
                              <button
                                key={c}
                                type="button"
                                onClick={() => setEditTagColor(c)}
                                className={cn(
                                  'w-6 h-6 rounded-full flex items-center justify-center transition-all',
                                  editTagColor === c && 'ring-2 ring-offset-1 ring-offset-[#1a2744] ring-white'
                                )}
                                style={{ backgroundColor: c }}
                              >
                                {editTagColor === c && <Check className="h-3 w-3 text-white" />}
                              </button>
                            ))}
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between pt-2 border-t border-slate-600">
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteProjectTag(tag.id)}
                            className="h-8 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            onClick={handleSaveEditTag}
                            disabled={!editTagLabel.trim() || isUpdating}
                            className="h-8 bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            Save
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {/* Separate Unlink Button */}
                  <button
                    type="button"
                    onClick={() => handleUnlinkTag(tag.id)}
                    className="inline-flex items-center px-1.5 py-1 rounded-r text-xs hover:opacity-70 transition-opacity"
                    style={{
                      backgroundColor: `${tag.color}20`,
                      color: tag.color,
                      border: `1px solid ${tag.color}40`,
                      borderLeft: 'none'
                    }}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}

              {/* Add tag popover */}
              <Popover open={tagPopoverOpen} onOpenChange={setTagPopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs border-dashed border-slate-600 text-slate-400 hover:text-white hover:bg-slate-800"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add Tag
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56 p-2 bg-[#1a2744] border-slate-600" align="start">
                  {!createTagOpen ? (
                    <>
                      <Input
                        placeholder="Search tags..."
                        value={tagSearch}
                        onChange={(e) => setTagSearch(e.target.value)}
                        className="h-8 mb-2 bg-[#0f1729] border-slate-600 text-white text-sm placeholder:text-slate-500"
                      />
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {availableTags.map(tag => (
                          <button
                            key={tag.id}
                            type="button"
                            onClick={() => handleLinkTag(tag)}
                            className="w-full flex items-center justify-between px-2 py-1.5 text-sm rounded hover:bg-slate-700 text-left group"
                          >
                            <span className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: tag.color }}
                              />
                              <span className="text-white">{tag.label}</span>
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteProjectTag(tag.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 hover:text-red-400 text-slate-500"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </button>
                        ))}
                        {availableTags.length === 0 && tagSearch && (
                          <p className="text-xs text-slate-500 px-2 py-1">No matching tags</p>
                        )}
                      </div>
                      <div className="border-t border-slate-600 mt-2 pt-2">
                        <button
                          type="button"
                          onClick={() => setCreateTagOpen(true)}
                          className="w-full flex items-center gap-2 px-2 py-1.5 text-sm rounded hover:bg-slate-700 text-slate-300"
                        >
                          <Plus className="h-3 w-3" />
                          Create new tag...
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setCreateTagOpen(false)}
                          className="text-slate-400 hover:text-white"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <span className="text-sm text-white font-medium">New Tag</span>
                      </div>
                      <Input
                        placeholder="Tag name..."
                        value={newTagLabel}
                        onChange={(e) => setNewTagLabel(e.target.value)}
                        className="h-8 bg-[#0f1729] border-slate-600 text-white text-sm placeholder:text-slate-500"
                        autoFocus
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {TAG_COLORS.map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setNewTagColor(c)}
                            className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center transition-all',
                              newTagColor === c && 'ring-2 ring-offset-1 ring-offset-[#1a2744] ring-white'
                            )}
                            style={{ backgroundColor: c }}
                          >
                            {newTagColor === c && <Check className="h-3 w-3 text-white" />}
                          </button>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setCreateTagOpen(false)}
                          className="flex-1 h-8 text-slate-400 hover:text-white"
                        >
                          Cancel
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          onClick={handleCreateTag}
                          disabled={!newTagLabel.trim() || isCreating}
                          className="flex-1 h-8 bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Create
                        </Button>
                      </div>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)}>
              <SelectTrigger className="bg-[#1a2744] border-slate-600 text-white">
                <SelectValue placeholder="Select status..." />
              </SelectTrigger>
              <SelectContent className="bg-[#1a2744] border-slate-600">
                {statuses.map((s) => (
                  <SelectItem key={s.value} value={s.value} className="text-white hover:bg-slate-700">
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-300">Color</Label>
            <div className="flex gap-2">
              {colors.map(({ value, label, className }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColor(value)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    className,
                    color === value && 'ring-2 ring-offset-2 ring-offset-[#0f1729] ring-white'
                  )}
                  title={label}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-slate-300">Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger className="bg-[#1a2744] border-slate-600 text-white">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2744] border-slate-600">
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p} className="text-white hover:bg-slate-700 capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="effort" className="text-slate-300">Estimated Effort</Label>
              <Input
                id="effort"
                value={estimatedEffort}
                onChange={(e) => setEstimatedEffort(e.target.value)}
                placeholder="e.g., 2 hours"
                className="bg-[#1a2744] border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="plannedDate" className="text-slate-300">Due Date</Label>
            <Input
              id="plannedDate"
              type="date"
              value={plannedDate}
              onChange={(e) => setPlannedDate(e.target.value)}
              className="bg-[#1a2744] border-slate-600 text-white"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="border-slate-600 text-slate-300 hover:bg-slate-800">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()} className="bg-blue-600 hover:bg-blue-700 text-white">
            {task ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
