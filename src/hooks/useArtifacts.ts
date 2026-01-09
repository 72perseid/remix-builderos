import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import type { Database } from '@/integrations/supabase/types';

type ArtifactType = Database['public']['Enums']['artifact_type'];

export interface ArtifactSummary {
  type: ArtifactType;
  status: string | null;
  hasData: boolean;
}

export function useArtifacts() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['artifacts', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];

      const { data, error } = await supabase
        .from('artifacts')
        .select('type, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Get unique types with their latest status
      const typeMap = new Map<ArtifactType, string | null>();
      data?.forEach((artifact) => {
        if (!typeMap.has(artifact.type)) {
          typeMap.set(artifact.type, artifact.status);
        }
      });

      const summaries: ArtifactSummary[] = [];
      typeMap.forEach((status, type) => {
        summaries.push({ type, status, hasData: true });
      });

      return summaries;
    },
    enabled: !!user?.id,
  });

  return {
    artifacts: query.data || [],
    loading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
