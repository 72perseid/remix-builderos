import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProjectContext } from '@/contexts/ProjectContext';
import { toast } from '@/hooks/use-toast';

const REQUEST_TIMEOUT_MS = 60000;

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface UseCopilotChatOptions {
  context: string;
  onArtifactRefresh?: () => void;
}

async function fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out');
    }
    throw error;
  }
}

export function useCopilotChat({ context, onArtifactRefresh }: UseCopilotChatOptions) {
  const { user } = useAuth();
  const { selectedAppId } = useProjectContext();
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id || !selectedAppId) {
      toast({
        title: 'Error',
        description: 'Please select an app first',
        variant: 'destructive',
      });
      return;
    }

    // Add user message to local state
    const userMessage: CopilotMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call the chat-action edge function
      const { data, error } = await supabase.functions.invoke('chat-action', {
        body: {
          message: content,
          user_id: user.id,
          app_idea_id: selectedAppId,
          workflowMode: 'chat',
          artifact_type: context,
        },
      });

      if (error) throw error;

      // Extract response from various possible formats
      const responseData = Array.isArray(data) ? data[0] : data;
      const aiResponse = 
        responseData?.output || 
        responseData?.message || 
        responseData?.response || 
        responseData?.text || 
        responseData?.content ||
        (typeof responseData === 'string' ? responseData : 'I received your request. How can I help further?');

      // Add assistant message to local state (display full text)
      const assistantMessage: CopilotMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Trigger refetch after successful response (n8n updates DB directly)
      if (onArtifactRefresh) {
        // Small delay to ensure n8n has finished writing to DB
        setTimeout(() => {
          onArtifactRefresh();
        }, 500);
      }

      return aiResponse;
    } catch (error) {
      console.error('Copilot error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      toast({
        title: 'Error',
        description: errorMessage === 'Request timed out' 
          ? 'The request took too long. Please try again.'
          : 'Failed to get response. Please try again.',
        variant: 'destructive',
      });

      // Add error message to chat
      const errorResponse: CopilotMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, selectedAppId, context, onArtifactRefresh]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    sendMessage,
    clearMessages,
    hasApp: !!selectedAppId,
  };
}
