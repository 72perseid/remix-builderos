import { z } from 'zod';
import { supabase } from '@/integrations/supabase/client';

export const coachingLeadSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be under 255 characters'),
  package: z.string().min(1).max(50),
  hours: z.number().int().positive().nullable().optional(),
  message: z.string().trim().max(1000, 'Message must be under 1000 characters').optional().or(z.literal('')),
});

export type CoachingLeadInput = z.infer<typeof coachingLeadSchema>;

export async function submitCoachingLead(input: CoachingLeadInput) {
  const parsed = coachingLeadSchema.parse(input);

  const { data: { session } } = await supabase.auth.getSession();
  const user_id = session?.user.id ?? null;

  const { data, error } = await supabase
    .from('leads')
    .insert({
      name: parsed.name,
      email: parsed.email,
      package: parsed.package,
      hours: parsed.hours ?? null,
      message: parsed.message?.trim() ? parsed.message.trim() : null,
      user_id,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
