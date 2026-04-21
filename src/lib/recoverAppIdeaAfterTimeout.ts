import { supabase } from '@/integrations/supabase/client';

export interface PollOptions {
  attempts?: number;
  intervalMs?: number;
}

export interface RecoveredAppIdea {
  id: string;
  created_at: string;
  app_name: string | null;
}

/**
 * Polls the app_ideas table looking for a row created during this session
 * that wasn't in the pre-existing snapshot. Used to detect when n8n
 * successfully created an app_idea despite a frontend timeout/error.
 */
export async function pollForNewAppIdea(
  userId: string,
  knownIds: Set<string>,
  sinceISO: string,
  options: PollOptions = {}
): Promise<RecoveredAppIdea | null> {
  const { attempts = 5, intervalMs = 6000 } = options;

  for (let i = 0; i < attempts; i++) {
    const { data, error } = await supabase
      .from('app_ideas')
      .select('id, created_at, app_name')
      .eq('user_id', userId)
      .gt('created_at', sinceISO)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('pollForNewAppIdea: query error', error);
    } else if (data && data.length > 0) {
      const fresh = data.find((row) => !knownIds.has(row.id));
      if (fresh) {
        console.log('pollForNewAppIdea: recovered app_idea', fresh.id);
        return fresh as RecoveredAppIdea;
      }
    }

    if (i < attempts - 1) {
      await new Promise((resolve) => setTimeout(resolve, intervalMs));
    }
  }

  return null;
}

/**
 * Determines whether an error from supabase.functions.invoke should trigger
 * the recovery polling flow (timeouts, network errors, 5xx).
 */
export function isRecoverableError(err: unknown): boolean {
  if (!err) return false;
  const message = err instanceof Error ? err.message : String(err);
  const lower = message.toLowerCase();

  if (lower.includes('timeout')) return true;
  if (lower.includes('network')) return true;
  if (lower.includes('failed to fetch')) return true;
  if (lower.includes('functionshttperror')) return true;
  if (lower.includes('non-2xx')) return true;
  // 5xx
  if (/\b5\d{2}\b/.test(message)) return true;

  return false;
}
