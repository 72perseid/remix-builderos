import { useEffect, useState } from 'react';
import { Task, TaskColor, TaskStatus, TaskCategory, TaskPriority } from '@/types';
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
import { cn } from '@/lib/utils';

interface TaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task?: Task | null;
  defaultStatus?: TaskStatus;
  onSave: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => void;
}

const colors: { value: TaskColor; label: string; className: string }[] = [
  { value: 'yellow', label: 'Yellow', className: 'bg-kanban-yellow' },
  { value: 'coral', label: 'Coral', className: 'bg-kanban-coral' },
  { value: 'mint', label: 'Mint', className: 'bg-kanban-mint' },
  { value: 'lavender', label: 'Lavender', className: 'bg-kanban-lavender' },
  { value: 'sky', label: 'Sky', className: 'bg-kanban-sky' },
];

const categories: TaskCategory[] = ['MVP', 'V1', 'Stretch Goals'];
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
  const [category, setCategory] = useState<TaskCategory | ''>('');
  const [priority, setPriority] = useState<TaskPriority | ''>('');
  const [plannedDate, setPlannedDate] = useState('');
  const [estimatedEffort, setEstimatedEffort] = useState('');

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
      setColor(task.color);
      setStatus(task.status);
      setCategory(task.category || '');
      setPriority(task.priority || '');
      setPlannedDate(task.plannedDate || '');
      setEstimatedEffort(task.estimatedEffort || '');
    } else {
      setTitle('');
      setDescription('');
      setColor('yellow');
      setStatus(defaultStatus);
      setCategory('');
      setPriority('');
      setPlannedDate('');
      setEstimatedEffort('');
    }
  }, [task, defaultStatus, open]);

  const handleSave = () => {
    if (!title.trim()) return;

    onSave({
      title: title.trim(),
      description: description.trim() || undefined,
      color,
      status,
      category: category || undefined,
      priority: priority || undefined,
      plannedDate: plannedDate || undefined,
      estimatedEffort: estimatedEffort || undefined,
      completedDate: task?.completedDate,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Color</Label>
            <div className="flex gap-2">
              {colors.map(({ value, label, className }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setColor(value)}
                  className={cn(
                    'w-8 h-8 rounded-full transition-all',
                    className,
                    color === value && 'ring-2 ring-offset-2 ring-foreground'
                  )}
                  title={label}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((p) => (
                    <SelectItem key={p} value={p} className="capitalize">{p}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="plannedDate">Planned Date</Label>
              <Input
                id="plannedDate"
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="effort">Estimated Effort</Label>
              <Input
                id="effort"
                value={estimatedEffort}
                onChange={(e) => setEstimatedEffort(e.target.value)}
                placeholder="e.g., 2 hours"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!title.trim()}>
            {task ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
