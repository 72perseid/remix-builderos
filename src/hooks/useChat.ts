import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProjectContext } from '@/contexts/ProjectContext';

const N8N_CHAT_WEBHOOK = 'https://amblabsdevaccount.app.n8n.cloud/webhook/4c31dc75-04a8-4638-b2f5-b94b2ab0de59';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export function useChat() {
  const { user } = useAuth();
  const { selectedAppId } = useProjectContext();
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  // Fetch or create session
  const sessionQuery = useQuery({
    queryKey: ['chat-session', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Try to get existing session
      const { data: existing } = await supabase
        .from('chat_sessions')
        .select('id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existing) {
        setSessionId(existing.id);
        return existing.id;
      }

      // Create new session
      const { data: newSession, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id, title: 'New Chat' })
        .select('id')
        .single();

      if (error) throw error;
      setSessionId(newSession.id);
      return newSession.id;
    },
    enabled: !!user?.id,
  });

  // Fetch messages for current session
  const messagesQuery = useQuery({
    queryKey: ['chat-messages', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];

      const { data, error } = await supabase
        .from('chat_messages')
        .select('id, role, content, created_at')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as ChatMessage[];
    },
    enabled: !!sessionId,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!sessionId || !user?.id) throw new Error('No session or user');

      // Save user message to DB
      const { error: insertError } = await supabase
        .from('chat_messages')
        .insert({
          session_id: sessionId,
          role: 'user',
          content,
        });

      if (insertError) throw insertError;

      setIsStreaming(true);

      try {
        // Call n8n webhook
        const response = await fetch(N8N_CHAT_WEBHOOK, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            user_id: user.id,
            session_id: sessionId,
            app_idea_id: selectedAppId, // null = new app, string = existing app
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get AI response');
        }

        const data = await response.json();
        
        // Debug: Log raw response to help troubleshoot
        console.log('Raw n8n response:', data);
        
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

        // Save assistant response to DB
        await supabase
          .from('chat_messages')
          .insert({
            session_id: sessionId,
            role: 'assistant',
            content: aiResponse,
          });

        return aiResponse;
      } finally {
        setIsStreaming(false);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['chat-messages', sessionId] });
    },
  });

  const sendMessage = useCallback(
    (content: string) => {
      return sendMessageMutation.mutateAsync(content);
    },
    [sendMessageMutation]
  );

  const clearChat = useCallback(async () => {
    if (!user?.id) return;

    // Create new session
    const { data: newSession, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: 'New Chat' })
      .select('id')
      .single();

    if (!error && newSession) {
      setSessionId(newSession.id);
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
    }
  }, [user?.id, queryClient]);

  return {
    messages: messagesQuery.data || [],
    loading: messagesQuery.isLoading || sessionQuery.isLoading,
    isStreaming,
    sendMessage,
    clearChat,
    error: messagesQuery.error || sendMessageMutation.error,
  };
}
