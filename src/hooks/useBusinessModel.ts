import { useCallback } from 'react';
import { BusinessModel } from '@/types';
import { useLocalStorage } from './useLocalStorage';

export function useBusinessModel() {
  const [businessModel, setBusinessModel] = useLocalStorage<BusinessModel | null>('builderos-business-model', null);

  const saveBusinessModel = useCallback((model: Partial<BusinessModel>) => {
    const now = new Date().toISOString();
    
    if (businessModel) {
      setBusinessModel({
        ...businessModel,
        ...model,
        updatedAt: now,
      });
    } else {
      setBusinessModel({
        id: crypto.randomUUID(),
        appIdeaId: model.appIdeaId || '',
        ...model,
        createdAt: now,
        updatedAt: now,
      });
    }
  }, [businessModel, setBusinessModel]);

  const updateGeneratedContent = useCallback((content: BusinessModel['generatedModel']) => {
    if (businessModel) {
      setBusinessModel({
        ...businessModel,
        generatedModel: content,
        updatedAt: new Date().toISOString(),
      });
    }
  }, [businessModel, setBusinessModel]);

  return {
    businessModel,
    saveBusinessModel,
    updateGeneratedContent,
  };
}
