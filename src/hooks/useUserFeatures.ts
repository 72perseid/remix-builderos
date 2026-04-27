import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

/**
 * Two-layer access model:
 *  - REACH (access_groups → features): which surfaces the user can navigate to.
 *    Read from `access_group_features_view`. Use `has(slug)` for this.
 *  - USE (enrollments booleans): which features the user is currently entitled
 *    to use (paid product). Use `hasUse('build' | 'calendar' | 'programs')`.
 *
 * Page-level gating (blur + LockedOverlay) is driven by USE because that's
 * the entitlement layer. Item-level locks (e.g. a paid course on the Programs
 * page) also use USE.
 *
 * Both queries resolve before `loading` flips to false so consumers don't
 * flicker between locked / unlocked states on first render.
 */
export function useUserFeatures() {
  const { user } = useAuth();

  const enrollmentQuery = useQuery({
    queryKey: ['user-enrollment', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('enrollments')
        .select('access_group_id, build_access, calendar_access, programs_access')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) {
        console.error('useUserFeatures: enrollment fetch failed', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  const accessGroupId = enrollmentQuery.data?.access_group_id ?? null;

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

  // Single loading flag — true until BOTH layers have settled, so consumers
  // never render a transient "locked" state while data is in flight.
  const loading =
    !user?.id ||
    enrollmentQuery.isLoading ||
    (enrollmentQuery.isSuccess && !!accessGroupId && featuresQuery.isLoading);

  const enrollment = enrollmentQuery.data;

  const useMap: Record<'build' | 'calendar' | 'programs', boolean> = {
    build: enrollment?.build_access === true,
    calendar: enrollment?.calendar_access === true,
    programs: enrollment?.programs_access === true,
  };

  return {
    loading,
    /** REACH check (access_groups). Use to hide nav items the user cannot reach. */
    has: (slug: string) => slugs.has(slug),
    /** USE check (enrollments). Use to gate features the user can reach but not yet use. */
    hasUse: (key: 'build' | 'calendar' | 'programs') => useMap[key],
    slugs,
    accessGroupId,
  };
}
