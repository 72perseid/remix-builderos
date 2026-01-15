import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Tables } from '@/integrations/supabase/types';

type AppIdea = Tables<'app_ideas'>;

interface ProjectContextType {
  selectedAppId: string | null;
  selectedApp: AppIdea | null;
  apps: AppIdea[];
  loading: boolean;
  selectApp: (appId: string) => void;
  clearSelection: () => void;
  refreshApps: () => Promise<void>;
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
        
        if (!validSelection && data && data.length > 0) {
          // Select the most recent app
          setSelectedAppId(data[0].id);
          localStorage.setItem(STORAGE_KEY, data[0].id);
        } else if (!data || data.length === 0) {
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
