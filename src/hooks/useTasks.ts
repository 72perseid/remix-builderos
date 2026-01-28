import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProjectContext } from '@/contexts/ProjectContext';
import { Task, TaskStatus, AcceptanceCriteriaItem } from '@/types';

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

  // Add task mutation
  const addTaskMutation = useMutation({
    mutationFn: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt' | 'position'>) => {
      if (!user?.id || !selectedAppId) throw new Error('Not authenticated or no app selected');

      const maxPosition = tasks.filter(t => t.status === task.status).length;
      const now = new Date().toISOString();

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
          checklist: task.checklist || [],
          position: maxPosition,
          created_at: now,
          updated_at: now,
        })
        .select()
        .single();

      if (error) throw error;
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
      
      const dbUpdates: Record<string, unknown> = {
        updated_at: now,
      };

      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.status !== undefined) dbUpdates.status = updates.status;
      if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
      if (updates.category !== undefined) dbUpdates.category = updates.category;
      if (updates.color !== undefined) dbUpdates.color = updates.color;
      if (updates.plannedDate !== undefined) dbUpdates.planned_date = updates.plannedDate;
      if (updates.estimatedEffort !== undefined) dbUpdates.estimated_effort = updates.estimatedEffort;
      if (updates.position !== undefined) dbUpdates.position = updates.position;
      if (updates.subtasks !== undefined) dbUpdates.subtasks = updates.subtasks;
      if (updates.checklist !== undefined) dbUpdates.checklist = updates.checklist;

      // Auto-set completion date when moved to done
      if (updates.status === 'done') {
        dbUpdates.completed_date = now;
      }

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

  const moveTask = useCallback((taskId: string, newStatus: TaskStatus, newPosition: number) => {
    updateTaskMutation.mutate({
      id: taskId,
      updates: { status: newStatus, position: newPosition },
    });
  }, [updateTaskMutation]);

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
      subtasks: task.subtasks || [],
      checklist: task.checklist || [],
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
