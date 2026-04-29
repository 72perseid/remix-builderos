import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Returns the current user's access group (name + slug) derived from their
 * enrollment record. Returns null if the user has no enrollment or no group.
 */
export function useUserAccessGroup() {
  const { user } = useAuth();

  const query = useQuery({
    queryKey: ['user-access-group', user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('enrollments')
        .select('access_group_id, access_groups:access_group_id ( name, slug )')
        .eq('user_id', user!.id)
        .maybeSingle();

      if (error) {
        console.error('useUserAccessGroup: fetch failed', error);
        return null;
      }

      const group = (data as any)?.access_groups;
      if (!group?.name) return null;
      return { name: group.name as string, slug: (group.slug as string) ?? null };
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    accessGroup: query.data ?? null,
    loading: query.isLoading,
  };
}
