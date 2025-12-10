import { supabase } from "@/integrations/supabase/client";

interface SyncResult {
  success: boolean;
  supabase_user_id?: string;
  xano_user_id?: number;
  results?: {
    profile?: { success?: boolean; error?: string };
    product?: { success?: boolean; error?: string };
    enrollment?: { success?: boolean; error?: string };
    app_idea?: { success?: boolean; error?: string };
  };
  error?: string;
}

/**
 * Syncs user data from Xano to Supabase
 * @param email - The email address of the user to sync
 * @returns SyncResult with status and synced data details
 */
export async function syncUserFromXano(email: string): Promise<SyncResult> {
  try {
    // The SDK handles Auth and API keys automatically
    const { data, error } = await supabase.functions.invoke('sync-user-from-xano', {
      body: { email: email }
    });

    if (error) throw error;
    
    return data;
  } catch (error) {
    console.error("Error syncing user from Xano:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
