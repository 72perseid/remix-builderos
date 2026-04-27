import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Resolves the set of feature slugs unlocked by the current user's access group.
 *
 * Single source of truth on the client for feature gating. Reads the
 * `access_group_features_view` (joined view of access_groups + features).
 *
 * Admins are NOT special-cased here — their access group is expected to be
 * mapped to every feature in `access_group_features`. The `useIsAdmin` hook
 * is only for /admin route gating.
 *
 * Feature slugs follow `features.slug` (e.g. 'build', 'programs', 'calendar').
 */
export function useUserFeatures() {
  const { user } = useAuth();

  const enrollmentQuery = useQuery({
    queryKey: ['user-access-group', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('enrollments')
        .select('access_group_id')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error('useUserFeatures: enrollment fetch failed', error);
        return null;
      }
      return data?.access_group_id ?? null;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const accessGroupId = enrollmentQuery.data ?? null;

  const featuresQuery = useQuery({
    queryKey: ['user-features', accessGroupId],
    queryFn: async () => {
      if (!accessGroupId) return new Set<string>();
      const { data, error } = await supabase
        .from('access_group_features_view')
        .select('feature_slug, feature_is_active, access_group_is_active')
        .eq('access_group_id', accessGroupId);
      if (error) {
        console.error('useUserFeatures: view fetch failed', error);
        return new Set<string>();
      }
      const set = new Set<string>();
      for (const row of data ?? []) {
        if (!row.feature_slug) continue;
        if (row.feature_is_active === false) continue;
        if (row.access_group_is_active === false) continue;
        set.add(row.feature_slug);
      }
      return set;
    },
    enabled: enrollmentQuery.isSuccess,
    staleTime: 5 * 60 * 1000,
  });

  const slugs = featuresQuery.data ?? new Set<string>();
  const loading = enrollmentQuery.isLoading || (enrollmentQuery.isSuccess && featuresQuery.isLoading);

  return {
    loading,
    has: (slug: string) => slugs.has(slug),
    slugs,
    accessGroupId,
  };
}
