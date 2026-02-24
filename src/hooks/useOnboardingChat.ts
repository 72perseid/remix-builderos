import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

export type WorkflowMode = 'onboarded' | 'new_app';

export interface OnboardingMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isHidden?: boolean;
}

export function useOnboardingChat() {
  const { user } = useAuth();
  
  // Generate a persistent session ID for the conversation
  const sessionIdRef = useRef<string>(crypto.randomUUID());
  
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode | null>(null);
  const [existingAppIdeaId, setExistingAppIdeaId] = useState<string | null>(null);
  const [modeLoading, setModeLoading] = useState(true);

  // On mount, determine workflowMode based on existing app_ideas
  useEffect(() => {
    if (!user?.id) return;

    const detectMode = async () => {
      setModeLoading(true);
      try {
        const { data, error: queryError } = await supabase
          .from('app_ideas')
          .select('id')
          .eq('user_id', user.id)
          .limit(1);

        if (queryError) {
          console.error('Error checking app_ideas:', queryError);
          setWorkflowMode('new_app');
        } else if (data && data.length > 0) {
          setWorkflowMode('onboarded');
          setExistingAppIdeaId(data[0].id);
        } else {
          setWorkflowMode('new_app');
        }
      } catch (err) {
        console.error('Failed to detect workflow mode:', err);
        setWorkflowMode('new_app');
      } finally {
        setModeLoading(false);
      }
    };

    detectMode();
  }, [user?.id]);

  const sendMessage = useCallback(
    async (content: string, isHidden: boolean = false): Promise<string> => {
      if (!user?.id) throw new Error('No user authenticated');
      if (!workflowMode) throw new Error('Workflow mode not yet determined');

      setError(null);

      // Add user message to state (unless hidden)
      if (!isHidden) {
        const userMessage: OnboardingMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content,
          timestamp: new Date(),
          isHidden: false,
        };
        setMessages(prev => [...prev, userMessage]);
      }

      setIsStreaming(true);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('chat-action', {
          body: {
            message: content,
            user_id: user.id,
            session_id: sessionIdRef.current,
            app_idea_id: workflowMode === 'onboarded' ? existingAppIdeaId : null,
            is_new_app: workflowMode === 'new_app',
            workflowMode,
          },
        });

        if (fnError) {
          throw new Error(`Failed to get AI response: ${fnError.message}`);
        }

        // Debug: Log raw response for troubleshooting
        console.log('Raw n8n onboarding response:', data);
        
        // Handle array vs object response
        const responseData = Array.isArray(data) ? data[0] : data;
        
        // Extract message from various possible keys
        const aiResponse = 
          responseData?.output || 
          responseData?.message || 
          responseData?.response || 
          responseData?.text || 
          responseData?.content ||
          (typeof responseData === 'string' ? responseData : 'Error: No message found in response');

        // Add assistant message to state
        const assistantMessage: OnboardingMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, assistantMessage]);

        return aiResponse;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setIsStreaming(false);
      }
    },
    [user?.id, workflowMode]
  );

  const startSession = useCallback(async () => {
    if (!user?.id || !workflowMode) return '';
    
    // Send a hidden start message — workflowMode in the payload tells n8n what to do
    return sendMessage('START_SESSION', true);
  }, [user?.id, workflowMode, sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    // Generate a new session ID for the next conversation
    sessionIdRef.current = crypto.randomUUID();
  }, []);

  // Allow overriding mode (e.g. when URL has ?mode=new)
  const forceNewAppMode = useCallback(() => {
    setWorkflowMode('new_app');
  }, []);

  return {
    messages: messages.filter(m => !m.isHidden),
    allMessages: messages,
    isStreaming,
    error,
    workflowMode,
    modeLoading,
    sendMessage,
    startSession,
    clearMessages,
    forceNewAppMode,
  };
}
