import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';
import { useCopilotChat, CopilotMessage, CopilotAttachment } from '@/hooks/useCopilotChat';
import { useIsMobile } from '@/hooks/use-mobile';
import { useProjectContext } from '@/contexts/ProjectContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Send, Loader2, X, AlertCircle, PanelLeftClose, PanelLeftOpen, PartyPopper, CheckCircle2, Paperclip, FileText, Image as ImageIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Context-aware suggestion prompts ─── */

const SUGGESTIONS: Record<string, string[]> = {
  business_model: ["What's my revenue model?", "Analyze my competitors", "Suggest pricing tiers", "Help me complete this artifact to 100%"],
  validation: ["Who's my target user?", "What risks should I test?", "Suggest interview questions", "Help me complete this artifact to 100%"],
  product_brief: ["Summarize my MVP scope", "What are the key features?", "Suggest success metrics", "Help me complete this artifact to 100%"],
  ui_ux: ["Suggest a color palette", "What screens do I need?", "Import Stitch AI design", "Recommend a layout", "Help me complete this artifact to 100%"],
  db_design: ["Suggest a schema", "What tables do I need?", "How should I handle auth?", "Help me complete this artifact to 100%"],
  master_prompt: ["Improve my prompt", "Add edge cases", "Make it more specific", "Help me complete this artifact to 100%"],
  kanban: ["Break down my tasks", "Suggest sprint goals", "What should I prioritize?", "Help me complete this artifact to 100%"],
};

const COMPLETION_CHIP = "Help me complete this artifact to 100%";

/* ─── Map context to completion column ─── */
const COMPLETION_KEY: Record<string, string> = {
  business_model: 'bm_completion',
  validation: 'uv_completion',
  product_brief: 'pb_completion',
  ui_ux: 'ux_completion',
};

/* ─── Memoized message bubble ─── */

const CopilotMessageBubble = React.memo(({ message }: { message: CopilotMessage }) => {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex w-full mb-3', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[85%] rounded-lg px-3 py-2 text-sm', isUser ? 'bg-primary text-primary-foreground' : 'bg-slate-800 text-slate-100')}>
        {message.attachments && message.attachments.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-1.5">
            {message.attachments.map((att, i) => (
              att.type === 'image' ? (
                <img key={i} src={att.data} alt={att.name} className="h-16 w-16 rounded object-cover border border-white/20" />
              ) : (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-white/10 rounded px-2 py-1">
                  <FileText className="h-3 w-3" /> {att.name}
                </span>
              )
            ))}
          </div>
        )}
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
});
CopilotMessageBubble.displayName = 'CopilotMessageBubble';

/* ─── Toggle button ─── */

export function CopilotToggleButton({
  heading = 'Copilot',
  onClick,
}: {
  heading?: string;
  onClick: () => void;
}) {
  return (
    <Button
      size="sm"
      onClick={onClick}
      className="gap-2 bg-primary hover:bg-primary/90 text-white rounded-full"
    >
      <MessageSquare className="h-4 w-4" />
      <span className="text-sm">{heading}</span>
    </Button>
  );
}

/* ─── Shared chat content (single implementation) ─── */

interface ChatContentProps {
  context: string;
  heading?: string;
  onArtifactRefresh?: () => void;
  onClose?: () => void;
  closeIcon?: 'collapse' | 'x';
}

const ChatContent = React.memo(function ChatContent({
  context,
  heading = 'Copilot',
  onArtifactRefresh,
  onClose,
  closeIcon = 'x',
}: ChatContentProps) {
  const navigate = useNavigate();
  const [inputValue, setInputValue] = useState('');
  const [pendingAttachments, setPendingAttachments] = useState<CopilotAttachment[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const rafRef = useRef<number>(0);
  const prevLoadingRef = useRef(false);
  const { messages, isLoading, sendMessage, suggestions: dynamicSuggestions, hasApp } = useCopilotChat({
    context,
    onArtifactRefresh,
  });
  const supportsAttachments = context === 'ui_ux';

  const { selectedAppId } = useProjectContext();
  const completionKey = COMPLETION_KEY[context];

  const { data: completionData, refetch: refetchCompletion } = useQuery({
    queryKey: ['copilot-completion', selectedAppId, completionKey],
    queryFn: async () => {
      if (!selectedAppId || !completionKey) return null;
      const { data } = await supabase
        .from('app_ideas')
        .select(completionKey)
        .eq('id', selectedAppId)
        .single();
      return (data as unknown as Record<string, number> | null)?.[completionKey] ?? 0;
    },
    enabled: !!selectedAppId && !!completionKey,
    refetchOnWindowFocus: false,
    refetchInterval: 10000,
  });

  const isComplete = completionData === 100;
  const [showCompletionPopup, setShowCompletionPopup] = useState(false);
  const prevCompleteRef = useRef(false);

  // Show popup when completion transitions to 100%
  useEffect(() => {
    if (isComplete && !prevCompleteRef.current) {
      setShowCompletionPopup(true);
    }
    prevCompleteRef.current = isComplete;
  }, [isComplete]);

  const rawSuggestions = dynamicSuggestions.length > 0 ? dynamicSuggestions : (SUGGESTIONS[context] || []);
  const activeSuggestions = isComplete
    ? rawSuggestions.filter(s => s !== COMPLETION_CHIP)
    : rawSuggestions;

  // Scroll to bottom on new messages and when loading finishes (suggestions appear)
  useEffect(() => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    if (prevLoadingRef.current && !isLoading) {
      // Immediately check if completion hit 100% after AI response
      refetchCompletion();
      const timer = setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 1000);
      prevLoadingRef.current = isLoading;
      return () => clearTimeout(timer);
    }
    prevLoadingRef.current = isLoading;
  }, [messages.length, isLoading, refetchCompletion]);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB (kept for backwards-compat references)
  const MAX_ATTACHMENTS = 3;
  const ACCEPTED_TYPES = 'image/png,image/jpeg,image/webp,.md,.markdown';

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (fileInputRef.current) fileInputRef.current.value = '';
    const { processSelectedFiles } = await import('@/lib/chatAttachments');
    const accepted = await processSelectedFiles(files, pendingAttachments.length);
    if (accepted.length > 0) {
      setPendingAttachments((prev) => [...prev, ...accepted]);
    }
  }, [pendingAttachments.length]);

  const removeAttachment = useCallback((index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  }, []);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if ((!inputValue.trim() && pendingAttachments.length === 0) || isLoading) return;
    const message = inputValue.trim() || (pendingAttachments.length > 0 ? 'Analyze these attachments' : '');
    setInputValue('');
    const atts = pendingAttachments.length > 0 ? [...pendingAttachments] : undefined;
    setPendingAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(message, atts);
  }, [inputValue, isLoading, sendMessage, pendingAttachments]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // Debounced textarea auto-resize via rAF
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const textarea = e.target;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    });
  }, []);

  // Memoize message list to avoid re-creating JSX on inputValue changes
  const messageList = useMemo(() => (
    messages.map((msg) => (
      <CopilotMessageBubble key={msg.id} message={msg} />
    ))
  ), [messages]);

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="font-medium text-white text-sm">{heading}</span>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className={cn(
              'h-7 w-7',
              closeIcon === 'x'
                ? 'text-white hover:text-white hover:bg-slate-700'
                : 'text-secondary-foreground hover:text-white hover:bg-slate-800',
            )}
            title={closeIcon === 'x' ? 'Close' : 'Collapse panel'}
          >
            {closeIcon === 'x' ? <X className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        )}
      </div>

      {/* Content */}
      {!hasApp ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-slate-500 mx-auto mb-2" />
            <p className="text-sm text-slate-400">Please select an app first</p>
          </div>
        </div>
      ) : (
        <>
          <ScrollArea className="flex-1 p-4">
            {messages.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="h-8 w-8 mx-auto mb-2 text-primary" />
                <p className="text-sm text-slate-400">
                  Ask me anything about your {context.replace('_', ' ')}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {messageList}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-800 rounded-lg px-3 py-2">
                      <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Suggestion chips */}
          {!isLoading && (messages.length === 0 || messages[messages.length - 1]?.role === 'assistant') && (
            <div className="flex flex-wrap gap-1.5 px-3 py-2 border-t border-slate-800/50 shrink-0">
              {activeSuggestions.map(text => (
                <button
                  key={text}
                  onClick={() => { setInputValue(''); sendMessage(text); }}
                  className="text-xs px-3 py-1.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/50 transition-colors cursor-pointer"
                >
                  {text}
                </button>
              ))}
            </div>
          )}

          {/* Attachment previews */}
          {supportsAttachments && pendingAttachments.length > 0 && (
            <div className="px-3 pt-2 border-t border-slate-800/50 shrink-0">
              <div className="flex flex-wrap gap-2 mb-1">
                {pendingAttachments.map((att, i) => (
                  <div key={i} className="relative group">
                    {att.type === 'image' ? (
                      <img src={att.data} alt={att.name} className="h-12 w-12 rounded object-cover border border-slate-700" />
                    ) : (
                      <div className="flex items-center gap-1 text-xs bg-slate-800 rounded px-2 py-1.5 border border-slate-700">
                        <FileText className="h-3 w-3 text-slate-400" /> <span className="text-slate-300 max-w-[80px] truncate">{att.name}</span>
                      </div>
                    )}
                    <button
                      onClick={() => removeAttachment(i)}
                      className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-2.5 w-2.5" />
                    </button>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">PNG, JPG, WEBP, or Markdown • Max 5MB each</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800/50 shrink-0">
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES}
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />
            <div className="flex gap-2 items-end">
              {supportsAttachments && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 h-[38px] w-[38px] text-muted-foreground hover:text-foreground"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isLoading || pendingAttachments.length >= MAX_ATTACHMENTS}
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="top">
                      <p>Attach image or .md file (max 5MB, up to 3)</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleTextareaChange}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                className="flex-1 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-sm min-h-[38px] max-h-[120px] resize-none py-2"
                disabled={isLoading}
                rows={1}
              />
              <Button
                type="submit"
                size="icon"
                disabled={(!inputValue.trim() && pendingAttachments.length === 0) || isLoading}
                className="shrink-0 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </>
      )}

      {/* Completion popup */}
      <AlertDialog open={showCompletionPopup} onOpenChange={setShowCompletionPopup}>
        <AlertDialogContent className="bg-slate-950 border-slate-800 text-foreground max-w-md">
          <AlertDialogHeader className="items-center text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/20">
              <PartyPopper className="h-6 w-6 text-primary" />
            </div>
            <AlertDialogTitle className="text-lg font-semibold text-white">
              🎉 Artifact 100% Complete!
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-3 text-sm text-slate-300 text-left">
                <p>
                  Great work! This artifact is now fully complete. You can close it and head back to your Project Board.
                </p>
                <p className="font-medium text-white">What happens next:</p>
                <ul className="space-y-2 list-none pl-0">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Your <strong>Project Board</strong> will be generated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Your <strong>Database Design</strong> will be created</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <span>Your <strong>Master Prompt</strong> will be generated</span>
                  </li>
                </ul>
                <p className="text-xs text-slate-400 italic">
                  💡 Tip: Check each generated artifact one by one to review and confirm the outputs.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center gap-2">
            <AlertDialogCancel className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white">
              Close
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => navigate('/master-prompt')}
            >
              Check it out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
});

/* ─── Desktop/Mobile side-panel ─── */

interface CopilotPanelProps {
  context: string;
  heading?: string;
  onArtifactRefresh?: () => void;
}

export function CopilotPanel({ context, heading = 'Copilot', onArtifactRefresh }: CopilotPanelProps) {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isCollapsed) {
    return (
      <div className="shrink-0 flex flex-col items-center py-3 px-1 border-r border-slate-800/50 bg-slate-950">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(false)}
          className="h-8 w-8 text-secondary-foreground hover:text-white hover:bg-slate-800"
          title="Open panel"
        >
          <PanelLeftOpen className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  const width = isMobile ? 380 : 380;

  return (
    <div
      className="shrink-0 h-full"
      style={{
        width,
        minWidth: isMobile ? undefined : 280,
        maxWidth: isMobile ? undefined : 500,
        resize: isMobile ? undefined : 'horizontal',
        overflow: 'hidden',
      }}
    >
      <ChatContent
        context={context}
        heading={heading}
        onArtifactRefresh={onArtifactRefresh}
        onClose={() => setIsCollapsed(true)}
        closeIcon="collapse"
      />
    </div>
  );
}

/* ─── Mobile overlay (AnimatePresence) ─── */

interface ArtifactCopilotProps {
  context: string;
  heading?: string;
  onArtifactRefresh?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

export function ArtifactCopilot({
  context,
  heading = 'Copilot',
  onArtifactRefresh,
  isOpen,
  onToggle,
}: ArtifactCopilotProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="absolute inset-0 z-40 flex flex-col bg-slate-950/95 backdrop-blur-sm"
        >
          <ChatContent
            context={context}
            heading={heading}
            onArtifactRefresh={onArtifactRefresh}
            onClose={onToggle}
            closeIcon="x"
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
