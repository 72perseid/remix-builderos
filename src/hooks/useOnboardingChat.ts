import { useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';

const N8N_WEBHOOK_URL = 'https://amblabsdevaccount.app.n8n.cloud/webhook/4c31dc75-04a8-4638-b2f5-b94b2ab0de59';

export interface OnboardingMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isHidden?: boolean;
}

export function useOnboardingChat() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = useCallback(
    async (content: string, isHidden: boolean = false, isNewApp: boolean = false): Promise<string> => {
      if (!user?.id) throw new Error('No user authenticated');

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
        const response = await fetch(N8N_WEBHOOK_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            user_id: user.id,
            is_new_app: isNewApp,
          }),
        });

        if (!response.ok) {
          throw new Error(`Failed to get AI response: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.response || data.message || data.output || JSON.stringify(data);

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
    [user?.id]
  );

  const startSession = useCallback(async (isNewApp: boolean = false) => {
    if (!user?.id) return '';
    
    // Send the hidden START_ONBOARDING_SESSION message with isNewApp flag
    const startMessage = isNewApp ? 'START_NEW_APP_SESSION' : 'START_ONBOARDING_SESSION';
    return sendMessage(startMessage, true, isNewApp);
  }, [user?.id, sendMessage]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages: messages.filter(m => !m.isHidden),
    allMessages: messages,
    isStreaming,
    error,
    sendMessage,
    startSession,
    clearMessages,
  };
}
