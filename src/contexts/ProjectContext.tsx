import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type AppIdea = Tables<'app_ideas'>;

interface ProjectContextType {
  selectedAppId: string | null;
  selectedApp: AppIdea | null;
  apps: AppIdea[];
  loading: boolean;
  selectApp: (appId: string) => void;
  clearSelection: () => void;
  refreshApps: () => Promise<void>;
  deleteApp: (appId: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

const STORAGE_KEY = 'builderos-selected-app-id';

export function ProjectProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [apps, setApps] = useState<AppIdea[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(() => {
    // Initialize from localStorage
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY);
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  const fetchApps = useCallback(async () => {
    if (!user?.id) {
      setApps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching apps:', error);
        setApps([]);
      } else {
        setApps(data || []);
        
        // Auto-select if no selection or selection is invalid
        const storedId = localStorage.getItem(STORAGE_KEY);
        const validSelection = data?.find(app => app.id === storedId);
        
        if (validSelection) {
          // Always explicitly set to ensure state is in sync
          setSelectedAppId(validSelection.id);
          localStorage.setItem(STORAGE_KEY, validSelection.id);
        } else if (data && data.length > 0) {
          // Fall back to the most recent app
          setSelectedAppId(data[0].id);
          localStorage.setItem(STORAGE_KEY, data[0].id);
        } else {
          setSelectedAppId(null);
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Error fetching apps:', error);
      setApps([]);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const selectApp = useCallback((appId: string) => {
    setSelectedAppId(appId);
    localStorage.setItem(STORAGE_KEY, appId);
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedAppId(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const deleteApp = useCallback(async (appId: string) => {
    try {
      // 1. Delete task_tags for tasks belonging to this app
      const { data: appTasks } = await supabase
        .from('tasks')
        .select('id')
        .eq('app_idea_id', appId);

      if (appTasks && appTasks.length > 0) {
        const taskIds = appTasks.map(t => t.id);
        await supabase.from('task_tags').delete().in('task_id', taskIds);
      }

      // 2. Delete tasks
      await supabase.from('tasks').delete().eq('app_idea_id', appId);

      // 3. Delete project_tags
      await supabase.from('project_tags').delete().eq('app_idea_id', appId);

      // 4. Delete artifacts
      await supabase.from('artifacts').delete().eq('app_idea_id', appId);

      // 5. Delete chat_messages for sessions belonging to this app
      const { data: appSessions } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('app_idea_id', appId);

      if (appSessions && appSessions.length > 0) {
        const sessionIds = appSessions.map(s => s.id);
        await supabase.from('chat_messages').delete().in('session_id', sessionIds);
      }

      // 6. Delete chat_sessions
      await supabase.from('chat_sessions').delete().eq('app_idea_id', appId);

      // 7. Delete business_models
      await supabase.from('business_models').delete().eq('app_idea_id', appId);

      // 8. Delete database_designs
      await supabase.from('database_designs').delete().eq('app_idea_id', appId);

      // 9. Delete the app itself
      const { error } = await supabase.from('app_ideas').delete().eq('id', appId);
      if (error) throw error;

      // If the deleted app was selected, clear selection
      if (selectedAppId === appId) {
        clearSelection();
      }

      await fetchApps();
      toast.success('App deleted successfully');
    } catch (err) {
      console.error('Error deleting app:', err);
      toast.error('Failed to delete app. Please try again.');
    }
  }, [selectedAppId, clearSelection, fetchApps]);

  const selectedApp = apps.find(app => app.id === selectedAppId) || null;

  return (
    <ProjectContext.Provider
      value={{
        selectedAppId,
        selectedApp,
        apps,
        loading,
        selectApp,
        clearSelection,
        refreshApps: fetchApps,
        deleteApp,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProjectContext() {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjectContext must be used within a ProjectProvider');
  }
  return context;
}
