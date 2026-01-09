import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type ArtifactType = Database['public']['Enums']['artifact_type'];

export function useArtifact(type: ArtifactType) {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['artifact', type, user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('artifacts')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return {
    data: query.data,
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
