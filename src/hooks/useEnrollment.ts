import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useEnrollment() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['enrollment-access', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('enrollments')
        .select('build_access, calendar_access, programs_access')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Error fetching enrollment:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  return {
    buildAccess: data?.build_access ?? false,
    calendarAccess: data?.calendar_access ?? false,
    programsAccess: data?.programs_access ?? false,
    loading: isLoading,
  };
}
