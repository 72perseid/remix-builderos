import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface AdminUserRow {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  profile_image: string | null;
  last_seen: string | null;
  created_at: string | null;
  role: 'admin' | 'user';
  enrollment: {
    id: string;
    status: string | null;
    access_group_id: string | null;
    access_group_name: string | null;
    build_access: boolean;
    calendar_access: boolean;
    programs_access: boolean;
  } | null;
}

interface Params {
  search: string;
  page: number;
  pageSize?: number;
}

export function useAdminUsers({ search, page, pageSize = 25 }: Params) {
  return useQuery({
    queryKey: ['admin-users', search, page, pageSize],
    queryFn: async () => {
      const from = page * pageSize;
      const to = from + pageSize - 1;

      let q = supabase
        .from('profiles')
        .select('id, first_name, last_name, email, profile_image, last_seen, created_at', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (search.trim()) {
        const s = search.trim().replace(/[,%]/g, '');
        q = q.or(`first_name.ilike.%${s}%,last_name.ilike.%${s}%,email.ilike.%${s}%`);
      }

      const { data: profiles, count, error } = await q;
      if (error) throw error;
      const userIds = (profiles ?? []).map(p => p.id);
      if (userIds.length === 0) return { rows: [] as AdminUserRow[], total: count ?? 0 };

      const [rolesRes, enrollRes, agRes] = await Promise.all([
        supabase.from('user_roles').select('user_id, role').in('user_id', userIds),
        supabase
          .from('enrollments')
          .select('id, user_id, status, access_group_id, build_access, calendar_access, programs_access, created_at')
          .in('user_id', userIds)
          .order('created_at', { ascending: false }),
        supabase.from('access_groups').select('id, name'),
      ]);

      const roleMap = new Map<string, 'admin' | 'user'>();
      (rolesRes.data ?? []).forEach(r => {
        // admin wins if multiple
        if (r.role === 'admin' || !roleMap.has(r.user_id)) roleMap.set(r.user_id, r.role as 'admin' | 'user');
      });

      const agMap = new Map<string, string>();
      (agRes.data ?? []).forEach(a => agMap.set(a.id, a.name));

      const enrollMap = new Map<string, any>();
      (enrollRes.data ?? []).forEach(e => {
        if (!enrollMap.has(e.user_id)) enrollMap.set(e.user_id, e); // most recent
      });

      const rows: AdminUserRow[] = (profiles ?? []).map(p => {
        const e = enrollMap.get(p.id);
        return {
          ...p,
          role: roleMap.get(p.id) ?? 'user',
          enrollment: e
            ? {
                id: e.id,
                status: e.status,
                access_group_id: e.access_group_id,
                access_group_name: e.access_group_id ? agMap.get(e.access_group_id) ?? null : null,
                build_access: e.build_access,
                calendar_access: e.calendar_access,
                programs_access: e.programs_access,
              }
            : null,
        };
      });

      return { rows, total: count ?? 0 };
    },
    staleTime: 30 * 1000,
  });
}
