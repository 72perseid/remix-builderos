import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export function useIsAdmin() {
  const { user } = useAuth();

  const { data, isLoading } = useQuery({
    queryKey: ['is-admin', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { data, error } = await supabase.rpc('has_role', {
        _user_id: user.id,
        _role: 'admin',
      });
      if (error) {
        console.error('useIsAdmin: has_role failed', error);
        return false;
      }
      return data === true;
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  return { isAdmin: !!data, loading: isLoading };
}
