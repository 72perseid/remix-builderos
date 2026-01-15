'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { GripVertical, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Task {
  id: string;
  title: string;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
  tags?: string[];
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color?: string;
}

interface KanbanBoardProps {
  columns: Column[];
  onColumnsChange?: (columns: Column[]) => void;
  className?: string;
}

const priorityColors: Record<string, string> = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
};

const tagColors: Record<string, string> = {
  MVP: 'bg-green-500/20 text-green-400 border-green-500/30',
  V1: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Stretch Goals': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Stretch: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
};

const availableTags = ['MVP', 'V1', 'Stretch Goals'];

export function KanbanBoard({ columns: initialColumns, onColumnsChange, className }: KanbanBoardProps) {
  const [columns, setColumns] = useState(initialColumns);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [activeColumnId, setActiveColumnId] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    tag: 'MVP',
  });

  const handleDragStart = (e: React.DragEvent, task: Task, columnId: string) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({ task, sourceColumnId: columnId }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const data = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { task, sourceColumnId } = data;

    if (sourceColumnId === targetColumnId) return;

    const newColumns = columns.map((col) => {
      if (col.id === sourceColumnId) {
        return { ...col, tasks: col.tasks.filter((t) => t.id !== task.id) };
      }
      if (col.id === targetColumnId) {
        return { ...col, tasks: [...col.tasks, task] };
      }
      return col;
    });

    setColumns(newColumns);
    onColumnsChange?.(newColumns);
  };

  const handleOpenAddTask = (columnId: string) => {
    setActiveColumnId(columnId);
    setNewTask({
      title: '',
      description: '',
      priority: 'medium',
      tag: 'MVP',
    });
    setIsAddTaskOpen(true);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim() || !activeColumnId) return;

    const task: Task = {
      id: `task-${Date.now()}`,
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      priority: newTask.priority,
      tags: [newTask.tag],
    };

    const newColumns = columns.map((col) => {
      if (col.id === activeColumnId) {
        return { ...col, tasks: [...col.tasks, task] };
      }
      return col;
    });

    setColumns(newColumns);
    onColumnsChange?.(newColumns);
    setIsAddTaskOpen(false);
    setActiveColumnId(null);
  };

  const activeColumn = columns.find((col) => col.id === activeColumnId);

  return (
    <>
      <div className={cn("flex gap-4 overflow-x-auto pb-4", className)}>
        {columns.map((column) => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80 bg-[#161e2a]/80 backdrop-blur-sm rounded-xl border border-white/10"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: column.color || '#6B8E23' }}
                  />
                  <span className="font-medium text-white text-sm">{column.title}</span>
                  <Badge variant="secondary" className="bg-white/10 text-slate-400 text-xs">
                    {column.tasks.length}
                  </Badge>
                </div>
                <button 
                  onClick={() => handleOpenAddTask(column.id)}
                  className="text-slate-500 hover:text-white hover:bg-white/10 rounded p-1 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tasks */}
            <div className="p-3 space-y-3 max-h-[500px] overflow-y-auto">
              {column.tasks.length === 0 ? (
                <button 
                  onClick={() => handleOpenAddTask(column.id)}
                  className="w-full text-xs text-slate-500 text-center py-8 hover:text-slate-400 hover:bg-white/5 rounded-lg transition-colors"
                >
                  Click + to add a task
                </button>
              ) : (
                column.tasks.map((task) => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    className="cursor-grab active:cursor-grabbing"
                  >
                    <Card className="bg-[#1a2332] border-white/5 hover:border-white/20 transition-all duration-200 shadow-lg">
                      <CardContent className="p-4">
                        <div className="space-y-3">
                          {/* Header with grip and title */}
                          <div className="flex items-start gap-2">
                            <GripVertical className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                            <h4 className="text-sm font-medium text-white leading-snug flex-1">
                              {task.title}
                            </h4>
                          </div>

                          {/* Description */}
                          {task.description && (
                            <p className="text-xs text-slate-400 line-clamp-2 pl-6">
                              {task.description}
                            </p>
                          )}

                          {/* Tags */}
                          {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pl-6">
                              {task.tags.map((tag) => (
                                <Badge
                                  key={tag}
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] px-2 py-0.5 border",
                                    tagColors[tag] || 'bg-slate-500/20 text-slate-400 border-slate-500/30'
                                  )}
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}

                          {/* Priority indicator */}
                          {task.priority && (
                            <div className="pl-6">
                              <Badge
                                variant="outline"
                                className={cn(
                                  "text-[10px] px-2 py-0.5 border capitalize",
                                  priorityColors[task.priority] || priorityColors.medium
                                )}
                              >
                                {task.priority}
                              </Badge>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent className="bg-[#161e2a] border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="text-white">
              Add Task to {activeColumn?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-slate-300">Title</Label>
              <Input
                id="title"
                value={newTask.title}
                onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                placeholder="Enter task title"
                className="bg-[#1a2332] border-white/10 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description" className="text-slate-300">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description (optional)"
                className="bg-[#1a2332] border-white/10 text-white placeholder:text-slate-500 min-h-[80px]"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Tag</Label>
                <Select value={newTask.tag} onValueChange={(value) => setNewTask({ ...newTask, tag: value })}>
                  <SelectTrigger className="bg-[#1a2332] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-white/10">
                    {availableTags.map((tag) => (
                      <SelectItem key={tag} value={tag} className="text-white hover:bg-white/10">
                        {tag}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-slate-300">Priority</Label>
                <Select 
                  value={newTask.priority} 
                  onValueChange={(value: 'low' | 'medium' | 'high') => setNewTask({ ...newTask, priority: value })}
                >
                  <SelectTrigger className="bg-[#1a2332] border-white/10 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a2332] border-white/10">
                    <SelectItem value="low" className="text-white hover:bg-white/10">Low</SelectItem>
                    <SelectItem value="medium" className="text-white hover:bg-white/10">Medium</SelectItem>
                    <SelectItem value="high" className="text-white hover:bg-white/10">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setIsAddTaskOpen(false)} className="text-slate-400 hover:text-white">
              Cancel
            </Button>
            <Button 
              onClick={handleAddTask} 
              disabled={!newTask.title.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add Task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export type { Task, Column, KanbanBoardProps };
