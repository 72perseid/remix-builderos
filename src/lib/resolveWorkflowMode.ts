import { supabase } from '@/integrations/supabase/client';

export type WorkflowMode = 'new' | 'onboarded' | 'chat';

export interface WorkflowState {
  workflowMode: WorkflowMode;
  appIdeaId: string | null;
}

/**
 * Derives workflowMode from whether the user has any app_ideas.
 * No ideas → 'new', has ideas → 'onboarded'.
 * The 'chat' mode is set explicitly by the copilot sidebar.
 */
export async function resolveWorkflowMode(userId: string): Promise<WorkflowState> {
  const { data: appIdea, error } = await supabase
    .from('app_ideas')
    .select('id')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('resolveWorkflowMode: error fetching app_ideas', error);
  }

  return {
    workflowMode: appIdea ? 'onboarded' : 'new',
    appIdeaId: appIdea?.id ?? null,
  };
}
