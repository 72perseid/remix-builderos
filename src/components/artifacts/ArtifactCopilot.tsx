import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCopilotChat, CopilotMessage } from '@/hooks/useCopilotChat';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageSquare, Send, Loader2, X, AlertCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

/* ─── Context-aware suggestion prompts ─── */

const SUGGESTIONS: Record<string, string[]> = {
  business_model: ["What's my revenue model?", "Analyze my competitors", "Suggest pricing tiers", "Help me complete this artifact to 100%"],
  validation: ["Who's my target user?", "What risks should I test?", "Suggest interview questions", "Help me complete this artifact to 100%"],
  product_brief: ["Summarize my MVP scope", "What are the key features?", "Suggest success metrics", "Help me complete this artifact to 100%"],
  ui_ux: ["Suggest a color palette", "What screens do I need?", "Recommend a layout", "Help me complete this artifact to 100%"],
  db_design: ["Suggest a schema", "What tables do I need?", "How should I handle auth?", "Help me complete this artifact to 100%"],
  master_prompt: ["Improve my prompt", "Add edge cases", "Make it more specific", "Help me complete this artifact to 100%"],
  kanban: ["Break down my tasks", "Suggest sprint goals", "What should I prioritize?", "Help me complete this artifact to 100%"],
};

/* ─── Memoized message bubble ─── */

const CopilotMessageBubble = React.memo(({ message }: { message: CopilotMessage }) => {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex w-full mb-3', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[85%] rounded-lg px-3 py-2 text-sm', isUser ? 'bg-primary text-primary-foreground' : 'bg-slate-800 text-slate-100')}>
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
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const rafRef = useRef<number>(0);
  const { messages, isLoading, sendMessage, suggestions: dynamicSuggestions, hasApp } = useCopilotChat({
    context,
    onArtifactRefresh,
  });

  const activeSuggestions = dynamicSuggestions.length > 0 ? dynamicSuggestions : (SUGGESTIONS[context] || []);

  // Scroll to bottom on new messages and when loading finishes (suggestions appear)
  useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      requestAnimationFrame(() => {
        el.scrollTop = el.scrollHeight;
      });
    }
  }, [messages.length, isLoading]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue.trim();
    setInputValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
    await sendMessage(message);
  }, [inputValue, isLoading, sendMessage]);

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
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
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

          <form onSubmit={handleSubmit} className="p-3 border-t border-slate-800/50 shrink-0">
            <div className="flex gap-2 items-end">
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
                disabled={!inputValue.trim() || isLoading}
                className="shrink-0 bg-primary hover:bg-primary/90"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </>
      )}
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
