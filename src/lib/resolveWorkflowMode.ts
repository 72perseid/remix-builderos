import { supabase } from '@/integrations/supabase/client';

export type WorkflowMode = 'new' | 'onboarded' | 'chat';

export interface WorkflowState {
  workflowMode: WorkflowMode;
  appIdeaId: string | null;
  appName: string | null;
  appDescription: string | null;
  appCategory: string | null;
}

const REQUIRED_ARTIFACTS = ['business_model', 'validation', 'product_brief'] as const;

/**
 * Determines the correct workflow_mode for a user by querying Supabase.
 *
 * - "new"       → no app_idea exists
 * - "onboarded" → app_idea exists but < 3 core artifacts are complete
 * - "chat"      → app_idea exists and all 3 core artifacts are complete
 */
export async function resolveWorkflowMode(userId: string): Promise<WorkflowState> {
  // 1. Get the most recent app idea for the user
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

  if (!appIdea) {
    return {
      workflowMode: 'new',
      appIdeaId: null,
      appName: null,
      appDescription: null,
      appCategory: null,
    };
  }

  // 2. Check which of the 3 required artifacts are complete
  const { data: artifacts, error: artError } = await supabase
    .from('artifacts')
    .select('type')
    .eq('app_idea_id', appIdea.id)
    .eq('user_id', userId)
    .in('type', [...REQUIRED_ARTIFACTS])
    .eq('status', 'complete');

  if (artError) {
    console.error('resolveWorkflowMode: error fetching artifacts', artError);
  }

  const completedTypes = new Set((artifacts ?? []).map((a) => a.type));
  const allComplete = REQUIRED_ARTIFACTS.every((t) => completedTypes.has(t));

  return {
    workflowMode: allComplete ? 'chat' : 'onboarded',
    appIdeaId: appIdea.id,
    appName: appIdea.app_name,
    appDescription: appIdea.app_description,
    appCategory: appIdea.app_category,
  };
}
