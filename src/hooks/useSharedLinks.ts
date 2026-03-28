import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface SharedLink {
  id: string;
  artifact_id: string;
  created_by: string;
  token: string;
  permission: 'view' | 'comment';
  expires_at: string | null;
  created_at: string;
}

export function useSharedLinks(artifactId: string | undefined) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: links = [], isLoading } = useQuery({
    queryKey: ['shared-links', artifactId],
    queryFn: async () => {
      if (!artifactId || !user?.id) return [];
      const { data, error } = await supabase
        .from('shared_links')
        .select('*')
        .eq('artifact_id', artifactId)
        .eq('created_by', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as SharedLink[];
    },
    enabled: !!artifactId && !!user?.id,
  });

  const createLink = useMutation({
    mutationFn: async ({ permission, expiresInDays }: { permission: 'view' | 'comment'; expiresInDays?: number }) => {
      if (!artifactId || !user?.id) throw new Error('Missing data');
      const expires_at = expiresInDays
        ? new Date(Date.now() + expiresInDays * 86400000).toISOString()
        : null;
      const { data, error } = await supabase
        .from('shared_links')
        .insert({ artifact_id: artifactId, created_by: user.id, permission, expires_at })
        .select()
        .single();
      if (error) throw error;
      return data as SharedLink;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shared-links', artifactId] }),
  });

  const deleteLink = useMutation({
    mutationFn: async (linkId: string) => {
      const { error } = await supabase.from('shared_links').delete().eq('id', linkId);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['shared-links', artifactId] }),
  });

  return { links, isLoading, createLink, deleteLink };
}

export function useSharedLinkByToken(token: string | undefined) {
  return useQuery({
    queryKey: ['shared-link-token', token],
    queryFn: async () => {
      if (!token) return null;
      const { data, error } = await supabase
        .from('shared_links')
        .select('*')
        .eq('token', token)
        .maybeSingle();
      if (error) throw error;
      if (!data) return null;
      if (data.expires_at && new Date(data.expires_at) < new Date()) return null;
      return data as SharedLink;
    },
    enabled: !!token,
  });
}
