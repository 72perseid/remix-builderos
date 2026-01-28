import { useEffect, useState } from 'react';
import { Task, TaskColor, TaskStatus, TaskCategory, TaskPriority, AcceptanceCriteriaItem } from '@/types';
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
  const [subtasks, setSubtasks] = useState<AcceptanceCriteriaItem[]>([]);
  const [checklist, setChecklist] = useState<AcceptanceCriteriaItem[]>([]);

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
      setSubtasks(task.subtasks || []);
      setChecklist(task.checklist || []);
    } else {
      setTitle('');
      setDescription('');
      setColor('yellow');
      setStatus(defaultStatus);
      setCategory('');
      setPriority('');
      setPlannedDate('');
      setEstimatedEffort('');
      setSubtasks([]);
      setChecklist([]);
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
      subtasks,
      checklist,
    });

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[#0f1729] border-slate-700">
        <DialogHeader>
          <DialogTitle className="text-white">{task ? 'Edit Task' : 'New Task'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
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
              <Label className="text-slate-300">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
                <SelectTrigger className="bg-[#1a2744] border-slate-600 text-white">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent className="bg-[#1a2744] border-slate-600">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="text-white hover:bg-slate-700">{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
