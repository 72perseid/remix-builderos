import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface ArtifactComment {
  id: string;
  artifact_id: string;
  user_id: string | null;
  guest_name: string | null;
  comment: string;
  created_at: string;
}

// Use untyped client to access tables not yet in generated types
const db = supabase as any;

export function useArtifactComments(artifactId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['artifact-comments', artifactId],
    queryFn: async () => {
      if (!artifactId) return [];
      const { data, error } = await db
        .from('artifact_comments')
        .select('*')
        .eq('artifact_id', artifactId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []) as ArtifactComment[];
    },
    enabled: !!artifactId,
  });

  const addComment = useMutation({
    mutationFn: async ({ comment, guestName }: { comment: string; guestName?: string }) => {
      if (!artifactId) throw new Error('No artifact');
      const payload: Record<string, unknown> = { artifact_id: artifactId, comment };
      if (user?.id) {
        payload.user_id = user.id;
      } else {
        payload.guest_name = guestName || 'Anonymous';
      }
      const { data, error } = await db
        .from('artifact_comments')
        .insert(payload)
        .select()
        .single();
      if (error) throw error;
      return data as ArtifactComment;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artifact-comments', artifactId] }),
  });

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const { error } = await db.from('artifact_comments').delete().eq('id', commentId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['artifact-comments', artifactId] }),
  });

  return { comments, isLoading, addComment, deleteComment };
}
