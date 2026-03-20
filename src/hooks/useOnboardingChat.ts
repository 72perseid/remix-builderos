import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { resolveWorkflowMode, type WorkflowMode } from '@/lib/resolveWorkflowMode';

export type { WorkflowMode };

export interface OnboardingMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isHidden?: boolean;
}

export function useOnboardingChat(forceNew: boolean = false) {
  const { user } = useAuth();

  const sessionIdRef = useRef<string | null>(null);
  const forcedNewAppRef = useRef(false);
  const preExistingAppIdsRef = useRef<Set<string>>(new Set());

  const [messages, setMessages] = useState<OnboardingMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [workflowMode, setWorkflowMode] = useState<WorkflowMode | null>(null);
  const [modeLoading, setModeLoading] = useState(true);
  const [bmCompletion, setBmCompletion] = useState(0);
  const [uvCompletion, setUvCompletion] = useState(0);
  const [pbCompletion, setPbCompletion] = useState(0);
  const [appIdeaId, setAppIdeaId] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Fetch completion percentages from app_ideas
  const fetchCompletion = useCallback(async (ideaId: string) => {
    const { data, error } = await supabase
      .from('app_ideas')
      .select('bm_completion, uv_completion, pb_completion')
      .eq('id', ideaId)
      .maybeSingle();

    if (error) {
      console.error('fetchCompletion error:', error);
      return;
    }
    if (data) {
      setBmCompletion((data as any).bm_completion ?? 0);
      setUvCompletion((data as any).uv_completion ?? 0);
      setPbCompletion((data as any).pb_completion ?? 0);
    }
  }, []);

  // On mount: resolve workflow mode and ensure a chat_session exists
  useEffect(() => {
    if (!user?.id) return;

    const init = async () => {
      setModeLoading(true);
      try {
        if (forceNew) {
          // New app mode: always create a fresh session, skip old data
          forcedNewAppRef.current = true;
          setWorkflowMode('new');
          setBmCompletion(0);
          setUvCompletion(0);
          setPbCompletion(0);
          setAppIdeaId(null);

          // Snapshot all existing app IDs so we can detect the newly created one later
          const { data: existingApps } = await supabase
            .from('app_ideas')
            .select('id')
            .eq('user_id', user.id);
          preExistingAppIdsRef.current = new Set((existingApps || []).map(a => a.id));

          const { data: newSession } = await supabase
            .from('chat_sessions')
            .insert({ user_id: user.id, title: 'Onboarding Chat', workflow_mode: 'new' })
            .select('id')
            .single();
          if (newSession) sessionIdRef.current = newSession.id;
          // No old messages to load
        } else {
          // Resolve workflow mode
          const state = await resolveWorkflowMode(user.id);
          setWorkflowMode(state.workflowMode);

          // Store appIdeaId and fetch completion
          if (state.appIdeaId) {
            setAppIdeaId(state.appIdeaId);
            await fetchCompletion(state.appIdeaId);
          }

          // Get or create a chat session — prefer one linked to the current app_idea
          let existingSession: { id: string } | null = null;

          if (state.appIdeaId) {
            const { data: linkedSession } = await supabase
              .from('chat_sessions')
              .select('id')
              .eq('user_id', user.id)
              .eq('app_idea_id', state.appIdeaId)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            existingSession = linkedSession;
          }

          // Fall back to most recent session if none linked
          if (!existingSession) {
            const { data: recentSession } = await supabase
              .from('chat_sessions')
              .select('id')
              .eq('user_id', user.id)
              .order('created_at', { ascending: false })
              .limit(1)
              .maybeSingle();
            existingSession = recentSession;
          }

          if (existingSession) {
            sessionIdRef.current = existingSession.id;
          } else {
            const { data: newSession } = await supabase
              .from('chat_sessions')
              .insert({ user_id: user.id, title: 'Onboarding Chat', workflow_mode: state.workflowMode })
              .select('id')
              .single();
            if (newSession) sessionIdRef.current = newSession.id;
          }

          // Load existing messages for this session
          if (sessionIdRef.current) {
            const { data: msgs } = await supabase
              .from('chat_messages')
              .select('id, role, content, created_at')
              .eq('session_id', sessionIdRef.current)
              .order('created_at', { ascending: true });

            if (msgs && msgs.length > 0) {
              setMessages(
                msgs.map((m) => ({
                  id: m.id,
                  role: m.role as 'user' | 'assistant',
                  content: m.content,
                  timestamp: new Date(m.created_at),
                }))
              );
            }
          }
        }
      } catch (err) {
        console.error('Onboarding init error:', err);
        setWorkflowMode('new');
      } finally {
        setModeLoading(false);
      }
    };

    init();
  }, [user?.id, forceNew]);

  const sendMessage = useCallback(
    async (content: string, isHidden: boolean = false): Promise<{ text: string; sessionComplete: boolean }> => {
      if (!user?.id) throw new Error('No user authenticated');

      setError(null);
      setSuggestions([]);

      // Use forced 'new' mode if set, otherwise resolve fresh
      let resolvedMode: WorkflowMode;
      let resolvedAppIdeaId: string | null = null;
      
      if (forcedNewAppRef.current) {
        resolvedMode = 'new';
      } else {
        const state = await resolveWorkflowMode(user.id);
        resolvedMode = state.workflowMode;
        resolvedAppIdeaId = state.appIdeaId ?? null;
      }
      setWorkflowMode(resolvedMode);

      const currentSessionId = sessionIdRef.current;
      if (!currentSessionId) throw new Error('No chat session');

      // Save user message to DB before calling webhook
      if (!isHidden) {
        await supabase.from('chat_messages').insert({
          session_id: currentSessionId,
          role: 'user',
          content,
        });

        const userMessage: OnboardingMessage = {
          id: crypto.randomUUID(),
          role: 'user',
          content,
          timestamp: new Date(),
          isHidden: false,
        };
        setMessages((prev) => [...prev, userMessage]);
      }

      setIsStreaming(true);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('chat-action', {
          body: {
            message: content,
            user_id: user.id,
            session_id: currentSessionId,
            workflowMode: resolvedMode,
            app_idea_id: resolvedAppIdeaId,
          },
        });

        if (fnError) {
          throw new Error(`Failed to get AI response: ${fnError.message}`);
        }

        console.log('Raw n8n onboarding response:', data);
        console.log('Raw data type:', typeof data, 'isArray:', Array.isArray(data));

        let responseData = Array.isArray(data) ? data[0] : data;

        // Handle double-stringified JSON from n8n
        if (typeof responseData === 'string') {
          try {
            responseData = JSON.parse(responseData);
          } catch {
            // It's a plain string, keep as-is
          }
        }

        console.log('Parsed responseData:', responseData);

        // Detect session_complete flag (comes as string "true" from n8n)
        const sessionComplete = responseData?.session_complete === true || responseData?.session_complete === 'true';

        // n8n always returns { response, session_complete } — use response field explicitly
        let aiResponse =
          (typeof responseData?.response === 'string' && responseData.response.length > 0
            ? responseData.response
            : null) ||
          responseData?.output ||
          responseData?.message ||
          responseData?.text ||
          responseData?.content ||
          (typeof responseData === 'string'
            ? responseData
            : 'Error: No message found in response');

        // Extract suggestions - prefer JSON field, fall back to text parsing
        let responseSuggestions: string[] = [];

        // 1. Check JSON field from n8n response
        const suggestionsFromJson = responseData?.suggestions;
        if (Array.isArray(suggestionsFromJson) && suggestionsFromJson.length > 0) {
          responseSuggestions = suggestionsFromJson.filter((s: unknown) => typeof s === 'string');
        }

        // 2. Fall back to parsing from message text
        if (responseSuggestions.length === 0) {
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

        console.log('Suggestions extracted:', responseSuggestions);
        setSuggestions(responseSuggestions);


        // Save assistant message to DB
        await supabase.from('chat_messages').insert({
          session_id: currentSessionId,
          role: 'assistant',
          content: aiResponse,
        });

        const assistantMessage: OnboardingMessage = {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);

        // Re-check workflow mode after each exchange
        const wasForcedNew = forcedNewAppRef.current;
        const latestState = await resolveWorkflowMode(user.id);

        if (wasForcedNew) {
          // Only exit "new" mode if a genuinely NEW app was created (not pre-existing)
          if (latestState.appIdeaId && !preExistingAppIdsRef.current.has(latestState.appIdeaId)) {
            forcedNewAppRef.current = false;
            setWorkflowMode('onboarded');
            resolvedAppIdeaId = latestState.appIdeaId;
            setAppIdeaId(latestState.appIdeaId);
            await fetchCompletion(latestState.appIdeaId);

            if (currentSessionId) {
              await supabase
                .from('chat_sessions')
                .update({ app_idea_id: latestState.appIdeaId, workflow_mode: 'onboarded' })
                .eq('id', currentSessionId);
            }
          }
          // Otherwise stay in 'new' mode — the new app hasn't been created yet
        } else if (latestState.appIdeaId) {
          // Normal (non-forced) flow
          setWorkflowMode('onboarded');
          resolvedAppIdeaId = latestState.appIdeaId;
          setAppIdeaId(latestState.appIdeaId);
          await fetchCompletion(latestState.appIdeaId);

          if (currentSessionId) {
            await supabase
              .from('chat_sessions')
              .update({ app_idea_id: latestState.appIdeaId, workflow_mode: 'onboarded' })
              .eq('id', currentSessionId);
          }
        } else if (resolvedAppIdeaId) {
          await fetchCompletion(resolvedAppIdeaId);
        }

        return { text: aiResponse, sessionComplete };
      } catch (err) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        setError(error);
        throw error;
      } finally {
        setIsStreaming(false);
      }
    },
    [user?.id, fetchCompletion]
  );

  const startSession = useCallback(async () => {
    if (!user?.id || !workflowMode) return '';
    return sendMessage('START_SESSION', true);
  }, [user?.id, workflowMode, sendMessage]);

  const clearMessages = useCallback(async () => {
    setMessages([]);
    if (!user?.id) return;

    // Create a fresh session
    const { data: newSession } = await supabase
      .from('chat_sessions')
      .insert({ user_id: user.id, title: 'Onboarding Chat', workflow_mode: 'new' })
      .select('id')
      .single();
    if (newSession) sessionIdRef.current = newSession.id;
  }, [user?.id]);

  const forceNewAppMode = useCallback(() => {
    forcedNewAppRef.current = true;
    setWorkflowMode('new');
  }, []);

  return {
    messages: messages.filter((m) => !m.isHidden),
    allMessages: messages,
    isStreaming,
    error,
    workflowMode,
    modeLoading,
    sendMessage,
    startSession,
    clearMessages,
    forceNewAppMode,
    bmCompletion,
    uvCompletion,
    pbCompletion,
    suggestions,
  };
}
