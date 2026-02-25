import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProjectContext } from '@/contexts/ProjectContext';
import { toast } from '@/hooks/use-toast';
import { resolveWorkflowMode } from '@/lib/resolveWorkflowMode';

const N8N_CHAT_WEBHOOK = 'https://amblabsdevaccount.app.n8n.cloud/webhook/master_os';
const REQUEST_TIMEOUT_MS = 90000; // Extended to 90 seconds for heavy N8N workflows

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

// Helper function to create a fetch with timeout
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

// Smart recovery: Check if a new app was created recently
async function checkForRecentlyCreatedApp(userId: string): Promise<string | null> {
  const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();
  
  const { data, error } = await supabase
    .from('app_ideas')
    .select('id, created_at')
    .eq('user_id', userId)
    .gte('created_at', twoMinutesAgo)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data.id;
}

export function useChat() {
  const { user } = useAuth();
  const { selectedAppId, refreshApps, selectApp } = useProjectContext();
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [isFinalizing, setIsFinalizing] = useState(false);
  const [newAppId, setNewAppId] = useState<string | null>(null);
  const [isNewAppMode, setIsNewAppMode] = useState(false);

  // Check if app is selected OR in new app creation mode
  const hasSelectedApp = !!selectedAppId || isNewAppMode;

  // Fetch or create session
  const sessionQuery = useQuery({
    queryKey: ['chat-session', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      try {
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
          .insert({ user_id: user.id, title: 'New Chat', workflow_mode: 'onboarded' })
          .select('id')
          .single();

        if (error) throw error;
        setSessionId(newSession.id);
        return newSession.id;
      } catch (error) {
        console.error('Session fetch error:', error);
        toast({
          title: 'Connection Error',
          description: 'Connection timed out. Please refresh.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    enabled: !!user?.id && (hasSelectedApp || isNewAppMode),
    retry: 1,
    staleTime: 30000,
  });

  // Fetch messages for current session
  const messagesQuery = useQuery({
    queryKey: ['chat-messages', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];

      try {
        const { data, error } = await supabase
          .from('chat_messages')
          .select('id, role, content, created_at')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });

        if (error) throw error;
        return data as ChatMessage[];
      } catch (error) {
        console.error('Messages fetch error:', error);
        toast({
          title: 'Connection Error',
          description: 'Connection timed out. Please refresh.',
          variant: 'destructive',
        });
        throw error;
      }
    },
    enabled: !!sessionId && (hasSelectedApp || isNewAppMode),
    retry: 1,
    staleTime: 10000,
  });

  // Complete the finalization and transition
  const completeTransition = useCallback(async (appId: string) => {
    try {
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ['app_ideas'] });
      await queryClient.invalidateQueries({ queryKey: ['artifacts'] });
      
      // Refresh apps and select the new one
      await refreshApps();
      selectApp(appId);
      
      setNewAppId(appId);
      
      // Small delay before marking as complete
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return true;
    } catch (error) {
      console.error('Transition error:', error);
      return false;
    }
  }, [queryClient, refreshApps, selectApp]);

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!sessionId || !user?.id) throw new Error('No session or user');
      if (!selectedAppId && !isNewAppMode) throw new Error('No app selected');

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
        // Resolve workflow mode fresh before every call
        const state = await resolveWorkflowMode(user.id);

        // Call n8n webhook with extended timeout
        const response = await fetchWithTimeout(
          N8N_CHAT_WEBHOOK,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: content,
              user_id: user.id,
              session_id: sessionId,
              workflowMode: state.workflowMode,
              app_idea_id: state.appIdeaId ?? selectedAppId,
            }),
          },
          REQUEST_TIMEOUT_MS
        );

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

        // Check for completion signal
        const isComplete = aiResponse.includes('JSON_GENERATION_COMPLETE');
        
        if (isComplete) {
          setIsFinalizing(true);
          
          // Extract app ID if available, or check for recently created app
          let createdAppId = responseData?.app_id || responseData?.appId;
          if (!createdAppId) {
            createdAppId = await checkForRecentlyCreatedApp(user.id);
          }
          
          if (createdAppId) {
            await completeTransition(createdAppId);
          }
        }

        // Save assistant response to DB
        await supabase
          .from('chat_messages')
          .insert({
            session_id: sessionId,
            role: 'assistant',
            content: aiResponse,
          });

        return { aiResponse, isComplete };
      } catch (error) {
        console.error('Send message error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        
        // SMART RECOVERY: Before showing error, check if app was created
        console.log('Attempting smart recovery...');
        const recoveredAppId = await checkForRecentlyCreatedApp(user.id);
        
        if (recoveredAppId) {
          console.log('Smart recovery successful! Found app:', recoveredAppId);
          setIsFinalizing(true);
          await completeTransition(recoveredAppId);
          
          // Save a success message instead of error
          await supabase
            .from('chat_messages')
            .insert({
              session_id: sessionId,
              role: 'assistant',
              content: '✅ Your app has been created successfully! Redirecting to your dashboard...',
            });
          
          return { aiResponse: 'App created successfully', isComplete: true };
        }
        
        // Only show error if smart recovery failed
        if (errorMessage === 'Request timed out') {
          toast({
            title: 'Connection Error',
            description: 'The request took too long. Please check your dashboard for the new app.',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to send message. Please try again.',
            variant: 'destructive',
          });
        }
        throw error;
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

  // Start new app creation mode - auto-sends session start message
  const startNewAppMode = useCallback(async () => {
    if (!user?.id) return;

    // Reset states
    setIsFinalizing(false);
    setNewAppId(null);
    setIsNewAppMode(true);

    try {
      // Create new session
      const { data: newSession, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id, title: 'New App Chat', workflow_mode: 'new' })
        .select('id')
        .single();

      if (error) throw error;
      
      setSessionId(newSession.id);
      queryClient.invalidateQueries({ queryKey: ['chat-messages'] });

      setIsStreaming(true);
      
      try {

        const response = await fetchWithTimeout(
          N8N_CHAT_WEBHOOK,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: 'START_NEW_APP_SESSION',
              user_id: user.id,
              session_id: newSession.id,
              workflowMode: 'new',
              app_idea_id: null,
            }),
          },
          REQUEST_TIMEOUT_MS
        );

        if (!response.ok) throw new Error('Failed to start session');

        const data = await response.json();
        const responseData = Array.isArray(data) ? data[0] : data;
        const aiResponse = 
          responseData?.output || 
          responseData?.message || 
          responseData?.response || 
          responseData?.text || 
          responseData?.content ||
          (typeof responseData === 'string' ? responseData : 'Hi! Tell me about the app you want to build.');

        // Save the AI response
        await supabase
          .from('chat_messages')
          .insert({
            session_id: newSession.id,
            role: 'assistant',
            content: aiResponse,
          });

        queryClient.invalidateQueries({ queryKey: ['chat-messages', newSession.id] });
      } catch (error) {
        console.error('Start session error:', error);
      } finally {
        setIsStreaming(false);
      }
    } catch (error) {
      console.error('Start new app mode error:', error);
      toast({
        title: 'Error',
        description: 'Failed to start new app session.',
        variant: 'destructive',
      });
    }
  }, [user?.id, queryClient]);

  const clearChat = useCallback(async () => {
    if (!user?.id) return;

    // Reset finalizing state
    setIsFinalizing(false);
    setNewAppId(null);
    setIsNewAppMode(false);

    try {
      // Create new session
      const { data: newSession, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: user.id, title: 'New Chat', workflow_mode: 'onboarded' })
        .select('id')
        .single();

      if (!error && newSession) {
        setSessionId(newSession.id);
        queryClient.invalidateQueries({ queryKey: ['chat-messages'] });
      }
    } catch (error) {
      console.error('Clear chat error:', error);
      toast({
        title: 'Error',
        description: 'Failed to clear chat. Please try again.',
        variant: 'destructive',
      });
    }
  }, [user?.id, queryClient]);

  const resetFinalizing = useCallback(() => {
    setIsFinalizing(false);
    setNewAppId(null);
  }, []);

  return {
    messages: messagesQuery.data || [],
    loading: messagesQuery.isLoading || sessionQuery.isLoading,
    isStreaming,
    isFinalizing,
    newAppId,
    isNewAppMode,
    sendMessage,
    clearChat,
    startNewAppMode,
    resetFinalizing,
    error: messagesQuery.error || sendMessageMutation.error,
    hasSelectedApp,
  };
}
