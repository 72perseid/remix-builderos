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
    const { data, error } = await supabase.functions.invoke("sync-user-from-xano", {
      body: null,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // The function uses query params, so we need to call it differently
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL || "https://bsogscaipffwkjszicfc.supabase.co"}/functions/v1/sync-user-from-xano?email=${encodeURIComponent(email)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to sync user data");
    }

    return await response.json();
  } catch (error) {
    console.error("Error syncing user from Xano:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred",
    };
  }
}
