import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useAdminUserDetail(userId: string | null) {
  return useQuery({
    queryKey: ['admin-user-detail', userId],
    queryFn: async () => {
      if (!userId) return null;
      const [profileRes, rolesRes, enrollRes, agRes, prodRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
        supabase.from('user_roles').select('role').eq('user_id', userId),
        supabase
          .from('enrollments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false }),
        supabase.from('access_groups').select('id, name'),
        supabase.from('products').select('id, product_name'),
      ]);
      if (profileRes.error) throw profileRes.error;

      const role: 'admin' | 'user' =
        (rolesRes.data ?? []).some(r => r.role === 'admin') ? 'admin' : 'user';

      const agMap = new Map<string, string>();
      (agRes.data ?? []).forEach(a => agMap.set(a.id, a.name));
      const prodMap = new Map<number, string>();
      (prodRes.data ?? []).forEach(p => prodMap.set(p.id, p.product_name));

      const enrollments = (enrollRes.data ?? []).map((e: any) => ({
        ...e,
        access_group_name: e.access_group_id ? agMap.get(e.access_group_id) ?? null : null,
        product_name: e.product_id ? prodMap.get(e.product_id) ?? null : null,
      }));

      return {
        profile: profileRes.data,
        role,
        enrollments,
      };
    },
    enabled: !!userId,
  });
}
