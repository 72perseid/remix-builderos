import { supabase } from '@/integrations/supabase/client';

export type WorkflowMode = 'new' | 'onboarded' | 'chat';

export interface WorkflowState {
  workflowMode: WorkflowMode;
  appIdeaId: string | null;
  appName: string | null;
  appDescription: string | null;
  appCategory: string | null;
}

/**
 * Reads workflow_mode directly from the profiles table (set by n8n)
 * and fetches the most recent app_idea for metadata.
 */
export async function resolveWorkflowMode(userId: string): Promise<WorkflowState> {
  // 1. Read workflow_mode from profiles
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('workflow_mode')
    .eq('id', userId)
    .maybeSingle();

  if (profileError) {
    console.error('resolveWorkflowMode: error fetching profile', profileError);
  }

  const workflowMode = ((profile as any)?.workflow_mode as WorkflowMode) ?? 'new';

  // 2. Get the most recent app idea for metadata
  const { data: appIdea, error: ideaError } = await supabase
    .from('app_ideas')
    .select('id, app_name, app_description, app_category')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (ideaError) {
    console.error('resolveWorkflowMode: error fetching app_ideas', ideaError);
  }

  return {
    workflowMode,
    appIdeaId: appIdea?.id ?? null,
    appName: appIdea?.app_name ?? null,
    appDescription: appIdea?.app_description ?? null,
    appCategory: appIdea?.app_category ?? null,
  };
}
