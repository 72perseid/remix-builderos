import { useState, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useProjectContext } from '@/contexts/ProjectContext';
import { toast } from '@/hooks/use-toast';
import type { ChatAttachment } from '@/lib/chatAttachments';

// Backwards-compat alias — existing imports of CopilotAttachment continue to work.
export type CopilotAttachment = ChatAttachment;

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  attachments?: CopilotAttachment[];
}

interface UseCopilotChatOptions {
  context: string;
  onArtifactRefresh?: () => void;
}

export function useCopilotChat({ context, onArtifactRefresh }: UseCopilotChatOptions) {
  const { user } = useAuth();
  const { selectedAppId } = useProjectContext();
  const [messages, setMessages] = useState<CopilotMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [sessionId] = useState(() => crypto.randomUUID());

  // Stable ref so sendMessage never depends on onArtifactRefresh identity
  const onArtifactRefreshRef = useRef(onArtifactRefresh);
  onArtifactRefreshRef.current = onArtifactRefresh;

  const sendMessage = useCallback(async (content: string, attachments?: CopilotAttachment[]) => {
    if (!user?.id || !selectedAppId) {
      toast({
        title: 'Error',
        description: 'Please select an app first',
        variant: 'destructive',
      });
      return;
    }

    const userMessage: CopilotMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
      timestamp: new Date(),
      attachments,
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Fetch latest artifact content for this type so n8n receives current
      // context without having to re-query Supabase server-side.
      let artifactContent: unknown = null;
      try {
        const { data: artifactRow } = await supabase
          .from('artifacts')
          .select('content')
          .eq('user_id', user.id)
          .eq('app_idea_id', selectedAppId)
          .eq('type', context as never)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();
        artifactContent = artifactRow?.content ?? null;
      } catch (artifactErr) {
        console.warn('[CopilotChat] Failed to load artifact content:', artifactErr);
      }

      const { data, error } = await supabase.functions.invoke('chat-action', {
        body: {
          message: content,
          user_id: user.id,
          session_id: sessionId,
          app_idea_id: selectedAppId,
          workflowMode: 'chat',
          artifact_type: context,
          artifact_content: artifactContent,
          ...(attachments && attachments.length > 0 ? { attachments } : {}),
        },
      });

      if (error) throw error;

      console.log('[CopilotChat] Raw response from n8n:', JSON.stringify(data).substring(0, 1000));

      let responseData = Array.isArray(data) ? data[0] : data;
      if (typeof responseData === 'string') {
        try { responseData = JSON.parse(responseData); } catch { /* plain string */ }
      }

      console.log('[CopilotChat] Parsed responseData:', JSON.stringify(responseData).substring(0, 1000));
      console.log('[CopilotChat] responseData.suggestions:', responseData?.suggestions);

      let aiResponse = [
        responseData?.response,
        responseData?.output,
        responseData?.message,
        responseData?.text,
        responseData?.content,
        typeof responseData === 'string' ? responseData : null,
      ].find(v => typeof v === 'string' && v.length > 0 && v !== 'No response from assistant.')
        || responseData?.output
        || 'The assistant did not return a response. Please try again.';

      // Extract suggestions - prefer JSON field, fall back to text parsing
      let responseSuggestions: string[] = [];
      const suggestionsFromJson = responseData?.suggestions;
      if (Array.isArray(suggestionsFromJson) && suggestionsFromJson.length > 0) {
        responseSuggestions = suggestionsFromJson.filter((s: unknown) => typeof s === 'string');
      } else {
        const suggestionsMatch = aiResponse.match(/suggestions:\s*(\[.*?\])/s);
        if (suggestionsMatch) {
          try {
            const parsed = JSON.parse(suggestionsMatch[1]);
            if (Array.isArray(parsed)) {
              responseSuggestions = parsed.filter((s: unknown) => typeof s === 'string');
            }
          } catch { /* ignore */ }
          aiResponse = aiResponse.replace(/\s*suggestions:\s*\[.*?\]/s, '').trim();
        }
      }
      console.log('[CopilotChat] Extracted suggestions:', responseSuggestions);
      setSuggestions(responseSuggestions);

      const assistantMessage: CopilotMessage = {
        id: crypto.randomUUID(),
        role: 'assistant',
        content: aiResponse,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Use ref to avoid stale closure and unstable dep
      if (onArtifactRefreshRef.current) {
        setTimeout(() => {
          onArtifactRefreshRef.current?.();
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
  }, [user?.id, selectedAppId, context, sessionId]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    suggestions,
    sendMessage,
    clearMessages,
    hasApp: !!selectedAppId,
  };
}
