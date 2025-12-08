import { useCallback } from 'react';
import { DatabaseDesign } from '@/types';
import { useLocalStorage } from './useLocalStorage';

export function useDatabaseDesign() {
  const [databaseDesign, setDatabaseDesign] = useLocalStorage<DatabaseDesign | null>('builderos-database-design', null);

  const saveDatabaseDesign = useCallback((design: Partial<DatabaseDesign>) => {
    const now = new Date().toISOString();
    
    if (databaseDesign) {
      setDatabaseDesign({
        ...databaseDesign,
        ...design,
        updatedAt: now,
      });
    } else {
      setDatabaseDesign({
        id: crypto.randomUUID(),
        appIdeaId: design.appIdeaId || '',
        ...design,
        createdAt: now,
        updatedAt: now,
      });
    }
  }, [databaseDesign, setDatabaseDesign]);

  const updateGeneratedContent = useCallback((content: DatabaseDesign['generatedDesign']) => {
    if (databaseDesign) {
      setDatabaseDesign({
        ...databaseDesign,
        generatedDesign: content,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [databaseDesign, setDatabaseDesign]);

  return {
    databaseDesign,
    saveDatabaseDesign,
    updateGeneratedContent,
  };
}
