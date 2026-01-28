import { useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProjectContext } from '@/contexts/ProjectContext';
import { ProjectTag } from '@/types';

const TAG_COLORS = [
  '#6366f1', // Indigo
  '#ef4444', // Red
  '#f97316', // Orange
  '#f59e0b', // Amber
  '#22c55e', // Green
  '#14b8a6', // Teal
  '#3b82f6', // Blue
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#6b7280', // Gray
];

export { TAG_COLORS };

export function useProjectTags() {
  const { selectedAppId } = useProjectContext();
  const queryClient = useQueryClient();

  const projectTagsQueryKey = ['project-tags', selectedAppId];
  const tasksQueryKeyPrefix = ['tasks'];

  // Fetch all project tags
  const { data: tags = [], isLoading } = useQuery({
    queryKey: projectTagsQueryKey,
    queryFn: async () => {
      if (!selectedAppId) return [];

      const { data, error } = await supabase
        .from('project_tags')
        .select('*')
        .eq('app_idea_id', selectedAppId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching project tags:', error);
        return [];
      }

      return data as ProjectTag[];
    },
    enabled: !!selectedAppId,
  });

  // Create a new tag
  const createTagMutation = useMutation({
    mutationFn: async ({ label, color }: { label: string; color: string }) => {
      if (!selectedAppId) throw new Error('No app selected');

      const { data, error } = await supabase
        .from('project_tags')
        .insert({
          label,
          color,
          app_idea_id: selectedAppId,
        })
        .select()
        .single();

      if (error) throw error;
      return data as ProjectTag;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectTagsQueryKey });
    },
  });

  // Delete a tag (cascades to task_tags)
  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      const { error } = await supabase
        .from('project_tags')
        .delete()
        .eq('id', tagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectTagsQueryKey });
      // Also invalidate tasks since their tags changed
      queryClient.invalidateQueries({ queryKey: tasksQueryKeyPrefix });
    },
  });

  // Link a tag to a task
  const linkTagMutation = useMutation({
    mutationFn: async ({ taskId, tagId }: { taskId: string; tagId: string }) => {
      const { error } = await supabase
        .from('task_tags')
        .insert({
          task_id: taskId,
          tag_id: tagId,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKeyPrefix });
    },
  });

  // Unlink a tag from a task
  const unlinkTagMutation = useMutation({
    mutationFn: async ({ taskId, tagId }: { taskId: string; tagId: string }) => {
      const { error } = await supabase
        .from('task_tags')
        .delete()
        .eq('task_id', taskId)
        .eq('tag_id', tagId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tasksQueryKeyPrefix });
    },
  });

  // Wrapper functions
  const createTag = useCallback(
    async (label: string, color: string) => {
      return createTagMutation.mutateAsync({ label, color });
    },
    [createTagMutation]
  );

  const deleteTag = useCallback(
    (tagId: string) => {
      deleteTagMutation.mutate(tagId);
    },
    [deleteTagMutation]
  );

  const linkTagToTask = useCallback(
    async (taskId: string, tagId: string) => {
      return linkTagMutation.mutateAsync({ taskId, tagId });
    },
    [linkTagMutation]
  );

  const unlinkTagFromTask = useCallback(
    async (taskId: string, tagId: string) => {
      return unlinkTagMutation.mutateAsync({ taskId, tagId });
    },
    [unlinkTagMutation]
  );

  return {
    tags,
    loading: isLoading,
    createTag,
    deleteTag,
    linkTagToTask,
    unlinkTagFromTask,
    isCreating: createTagMutation.isPending,
    isDeleting: deleteTagMutation.isPending,
  };
}
