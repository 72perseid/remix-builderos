import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProjectContext } from '@/contexts/ProjectContext';
import { Task, TaskStatus, AcceptanceCriteriaItem } from '@/types';
import type { TablesUpdate } from '@/integrations/supabase/types';

export function useTasks() {
  const { user } = useAuth();
  const { selectedAppId } = useProjectContext();
  const queryClient = useQueryClient();

  const queryKey = ['tasks', user?.id, selectedAppId];

  // Fetch tasks from Supabase
  const { data: tasks = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!user?.id || !selectedAppId) return [];

      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('app_idea_id', selectedAppId)
        .order('position', { ascending: true });

      if (error) {
        console.error('Error fetching tasks:', error);
        return [];
      }

      // Map old status values to new ones
      const mapStatus = (status: string | null): TaskStatus => {
        if (!status) return 'backlog';
        
        // Map old statuses to new column structure
        const statusMap: Record<string, TaskStatus> = {
          'planning': 'selected',      // Old "planning" -> "Selected for Development"
          'in-progress': 'in_progress', // Old "in-progress" -> "In Progress"
          'review': 'qa',               // Old "review" -> "In QA"
          // Keep these as-is
          'backlog': 'backlog',
          'selected': 'selected',
          'in_progress': 'in_progress',
          'qa': 'qa',
          'done': 'done',
        };
        
        return statusMap[status] || 'backlog';
      };

      // Parse checklist JSON safely
      const parseChecklist = (checklist: unknown): AcceptanceCriteriaItem[] => {
        if (!checklist) return [];
        if (Array.isArray(checklist)) {
          return checklist.filter(
            (item): item is AcceptanceCriteriaItem => 
              typeof item === 'object' && 
              item !== null && 
              'id' in item && 
              'text' in item && 
              'done' in item
          );
        }
        return [];
      };

      // Map database fields to Task type
      return (data || []).map(task => ({
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: mapStatus(task.status),
        priority: task.priority as Task['priority'] || 'medium',
        category: task.category || '',
        color: task.color as Task['color'] || 'gray',
        plannedDate: task.planned_date || undefined,
        completedDate: task.completed_date || undefined,
        estimatedEffort: task.estimated_effort || undefined,
        subtasks: parseChecklist(task.subtasks),
        checklist: parseChecklist(task.checklist),
        position: task.position || 0,
        createdAt: task.created_at || new Date().toISOString(),
        updatedAt: task.updated_at || new Date().toISOString(),
      })) as Task[];
    },
    enabled: !!user?.id && !!selectedAppId,
  });

  // Add task mutation — inserts at position 0 (top) and shifts existing column rows down
  const addTaskMutation = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => {
      if (!user?.id || !selectedAppId) throw new Error('Not authenticated or no app selected');

      const now = new Date().toISOString();

      // Insert new task at position 0
      const { data, error } = await supabase
        .from('tasks')
        .insert({
          user_id: user.id,
          app_idea_id: selectedAppId,
          title: task.title,
          description: task.description || null,
          status: task.status,
          priority: task.priority,
          category: task.category || null,
          color: task.color || null,
          planned_date: task.plannedDate || null,
          estimated_effort: task.estimatedEffort || null,
          checklist: (task.checklist || []) as unknown as import('@/integrations/supabase/types').Json,
          position: 0,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) throw error;

      // Shift existing tasks in same column down by +1 (preserve previous order)
      const existing = tasks
        .filter(t => t.status === task.status)
        .sort((a, b) => a.position - b.position);

      if (existing.length > 0) {
        const shifted = existing.map((t, idx) => ({
          id: t.id,
          user_id: user.id,
          app_idea_id: selectedAppId,
          title: t.title,
          status: t.status,
          position: idx + 1,
          updated_at: now,
        }));

        const { error: shiftError } = await supabase
          .from('tasks')
          .upsert(shifted, { onConflict: 'id' });

        if (shiftError) console.error('Error shifting task positions:', shiftError);
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Task> }) => {
      const now = new Date().toISOString();
      
      const dbUpdates: TablesUpdate<'tasks'> = {
        updated_at: now,
        ...(updates.title !== undefined && { title: updates.title }),
        ...(updates.description !== undefined && { description: updates.description }),
        ...(updates.status !== undefined && { status: updates.status }),
        ...(updates.priority !== undefined && { priority: updates.priority }),
        ...(updates.category !== undefined && { category: updates.category }),
        ...(updates.color !== undefined && { color: updates.color }),
        ...(updates.plannedDate !== undefined && { planned_date: updates.plannedDate }),
        ...(updates.estimatedEffort !== undefined && { estimated_effort: updates.estimatedEffort }),
        ...(updates.position !== undefined && { position: updates.position }),
        ...(updates.subtasks !== undefined && { subtasks: updates.subtasks as any }),
        ...(updates.checklist !== undefined && { checklist: updates.checklist as any }),
        ...(updates.status === 'done' && { completed_date: now }),
      };

      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
    },
  });

  // Wrapper functions matching the original API
  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => {
    addTaskMutation.mutate(task);
  }, [addTaskMutation]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    updateTaskMutation.mutate({ id, updates });
  }, [updateTaskMutation]);

  const deleteTask = useCallback((id: string) => {
    deleteTaskMutation.mutate(id);
  }, [deleteTaskMutation]);

  // Move task: batch-recalculates positions across affected column(s) sequentially
  const moveTask = useCallback(async (taskId: string, newStatus: TaskStatus, newPosition: number) => {
    if (!user?.id || !selectedAppId) return;

    const moving = tasks.find(t => t.id === taskId);
    if (!moving) return;

    const oldStatus = moving.status;
    const now = new Date().toISOString();

    // Build destination column ordered list (without the moving task), then insert at newPosition
    const destList = tasks
      .filter(t => t.status === newStatus && t.id !== taskId)
      .sort((a, b) => a.position - b.position);

    const clampedPos = Math.max(0, Math.min(newPosition, destList.length));
    const newDest = [...destList];
    const movedTask = { ...moving, status: newStatus };
    newDest.splice(clampedPos, 0, movedTask);

    // Compose rows to upsert
    const rows: Array<{
      id: string;
      user_id: string;
      app_idea_id: string;
      title: string;
      status: string;
      position: number;
      updated_at: string;
    }> = newDest.map((t, idx) => ({
      id: t.id,
      user_id: user.id,
      app_idea_id: selectedAppId,
      title: t.title,
      status: newStatus,
      position: idx,
      updated_at: now,
    }));

    // If moving across columns, also resequence the source column (without the moved task)
    if (oldStatus !== newStatus) {
      const sourceList = tasks
        .filter(t => t.status === oldStatus && t.id !== taskId)
        .sort((a, b) => a.position - b.position);

      sourceList.forEach((t, idx) => {
        rows.push({
          id: t.id,
          user_id: user.id,
          app_idea_id: selectedAppId,
          title: t.title,
          status: oldStatus,
          position: idx,
          updated_at: now,
        });
      });
    }

    // Optimistic update
    queryClient.setQueryData<Task[]>(queryKey, (prev) => {
      if (!prev) return prev;
      const byId = new Map(prev.map(t => [t.id, t]));
      rows.forEach(r => {
        const existing = byId.get(r.id);
        if (existing) {
          byId.set(r.id, {
            ...existing,
            status: r.status as TaskStatus,
            position: r.position,
            updatedAt: r.updated_at,
          });
        }
      });
      return Array.from(byId.values());
    });

    const { error } = await supabase
      .from('tasks')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('Error moving task (batch):', error);
    }

    queryClient.invalidateQueries({ queryKey });
  }, [user?.id, selectedAppId, tasks, queryClient, queryKey]);

  const importTasks = useCallback(async (newTasks: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>[]) => {
    if (!user?.id || !selectedAppId) return;

    const now = new Date().toISOString();
    const existingBacklogCount = tasks.filter(t => t.status === 'backlog').length;

    const tasksToInsert = newTasks.map((task, index) => ({
      user_id: user.id,
      app_idea_id: selectedAppId,
      title: task.title,
      description: task.description || null,
      status: task.status,
      priority: task.priority,
      category: task.category || null,
      color: task.color || null,
      planned_date: task.plannedDate || null,
      estimated_effort: task.estimatedEffort || null,
      subtasks: (task.subtasks || []) as unknown as import('@/integrations/supabase/types').Json,
      checklist: (task.checklist || []) as unknown as import('@/integrations/supabase/types').Json,
      position: existingBacklogCount + index,
      created_at: now,
      updated_at: now,
    }));

    const { error } = await supabase
      .from('tasks')
      .insert(tasksToInsert);

    if (error) {
      console.error('Error importing tasks:', error);
    } else {
      queryClient.invalidateQueries({ queryKey });
    }
  }, [user?.id, selectedAppId, tasks, queryClient, queryKey]);

  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return tasks
      .filter(task => task.status === status)
      .sort((a, b) => a.position - b.position);
  }, [tasks]);

  return {
    tasks,
    loading: isLoading,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    importTasks,
    getTasksByStatus,
  };
}
