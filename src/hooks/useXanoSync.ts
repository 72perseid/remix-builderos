import { useEffect, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { syncUserFromXano } from '@/lib/syncXano';
import { useToast } from '@/hooks/use-toast';

/**
 * Hook to automatically sync user data from Xano when authenticated.
 * Runs silently in the background - only shows toast on critical errors.
 */
export function useXanoSync(user: User | null) {
  const { toast } = useToast();
  const hasSynced = useRef(false);

  useEffect(() => {
    // Only sync once per session, when user is available
    if (!user?.email || hasSynced.current) return;

    const performSync = async () => {
      console.log('Syncing Xano data...');
      hasSynced.current = true;

      try {
        const result = await syncUserFromXano(user.email!);

        if (result.success) {
          console.log('Xano sync completed:', result);
        } else {
          console.error('Xano sync failed:', result.error);
          // Only show toast for critical errors (not missing data scenarios)
          if (result.error?.includes('network') || result.error?.includes('fetch')) {
            toast({
              title: "Sync Error",
              description: "Could not sync your data. Please try refreshing.",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error('Xano sync exception:', error);
        toast({
          title: "Sync Error",
          description: "A network error occurred while syncing your data.",
          variant: "destructive",
        });
      }
    };

    performSync();
  }, [user?.email, toast]);
}
