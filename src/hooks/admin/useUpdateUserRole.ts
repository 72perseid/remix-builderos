import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useUpdateUserRole() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: 'admin' | 'user' }) => {
      // Delete existing roles for the user, then insert the chosen one.
      const { error: delErr } = await supabase.from('user_roles').delete().eq('user_id', userId);
      if (delErr) throw delErr;
      const { error: insErr } = await supabase.from('user_roles').insert({ user_id: userId, role });
      if (insErr) throw insErr;
    },
    onSuccess: (_d, vars) => {
      toast.success(`Role updated to ${vars.role}`);
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-user-detail', vars.userId] });
      qc.invalidateQueries({ queryKey: ['is-admin', vars.userId] });
    },
    onError: (err: any) => {
      toast.error(`Failed to update role: ${err.message ?? err}`);
    },
  });
}
