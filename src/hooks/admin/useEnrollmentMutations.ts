import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface EnrollmentInput {
  user_id: string;
  access_group_id: string | null;
  product_id: number | null;
  status: string;
  enrollment_method?: string;
  build_expires_at: string | null;
  calendar_expires_at: string | null;
  programs_expires_at: string | null;
}

function invalidate(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ['admin-users'] });
  qc.invalidateQueries({ queryKey: ['admin-enrollments'] });
  qc.invalidateQueries({ queryKey: ['admin-user-detail'] });
}

export function useCreateEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: EnrollmentInput) => {
      const now = new Date().toISOString();
      const { error } = await supabase.from('enrollments').insert({
        ...input,
        enrollment_method: input.enrollment_method ?? 'manual',
        created_at: now,
        updated_at: now,
        // access flags are derived by enforce_enrollment_access trigger
        build_access: false,
        calendar_access: false,
        programs_access: false,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Enrollment created');
      invalidate(qc);
    },
    onError: (err: any) => toast.error(`Failed to create enrollment: ${err.message ?? err}`),
  });
}

export function useUpdateEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...patch }: Partial<EnrollmentInput> & { id: string }) => {
      const { error } = await supabase
        .from('enrollments')
        .update({ ...patch, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Enrollment updated');
      invalidate(qc);
    },
    onError: (err: any) => toast.error(`Failed to update enrollment: ${err.message ?? err}`),
  });
}

export function useExpireEnrollment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('enrollments')
        .update({
          status: 'expired',
          build_expires_at: null,
          calendar_expires_at: null,
          programs_expires_at: null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Enrollment expired');
      invalidate(qc);
    },
    onError: (err: any) => toast.error(`Failed to expire enrollment: ${err.message ?? err}`),
  });
}
