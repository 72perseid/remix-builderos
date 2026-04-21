import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminUserDetail(userId: string | null) {
  return useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: async () => {
      if (!userId) return null;
      const [profileRes, rolesRes, enrollRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', userId),
        supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
      ]);
      if (profileRes.error) throw profileRes.error;

      const role: 'admin' | 'user' =
        (rolesRes.data ?? []).some(r => r.role === 'admin') ? 'admin' : 'user';

      return {
        profile: profileRes.data,
        role,
        enrollments: enrollRes.data ?? [],
      };
    },
    enabled: !!userId,
  });
}
