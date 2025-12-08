import { useCallback } from 'react';
import { AppIdea } from '@/types';
import { useLocalStorage } from './useLocalStorage';

export function useAppIdea() {
  const [appIdea, setAppIdea] = useLocalStorage<AppIdea | null>('builderos-app-idea', null);

  const saveAppIdea = useCallback((idea: Partial<AppIdea>) => {
    const now = new Date().toISOString();
    
    if (appIdea) {
      setAppIdea({
        ...appIdea,
        ...idea,
        updatedAt: now,
      });
    } else {
      setAppIdea({
        id: crypto.randomUUID(),
        appName: idea.appName || '',
        appDescription: idea.appDescription || '',
        ...idea,
        createdAt: now,
        updatedAt: now,
      });
    }
  }, [appIdea, setAppIdea]);

  const updateGeneratedContent = useCallback((content: AppIdea['ideaGeneration']) => {
    if (appIdea) {
      setAppIdea({
        ...appIdea,
        ideaGeneration: content,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [appIdea, setAppIdea]);

  return {
    appIdea,
    saveAppIdea,
    updateGeneratedContent,
  };
}
