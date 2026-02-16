import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCopilotChat, CopilotMessage } from '@/hooks/useCopilotChat';
import { useIsMobile } from '@/hooks/use-mobile';
import { MessageSquare, Send, Loader2, X, AlertCircle, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ArtifactCopilotProps {
  context: string;
  heading?: string;
  onArtifactRefresh?: () => void;
  isOpen: boolean;
  onToggle: () => void;
}

interface CopilotPanelProps {
  context: string;
  heading?: string;
  onArtifactRefresh?: () => void;
}

function CopilotMessageBubble({ message }: { message: CopilotMessage }) {
  const isUser = message.role === 'user';
  return (
    <div className={cn('flex w-full mb-3', isUser ? 'justify-end' : 'justify-start')}>
      <div className={cn('max-w-[85%] rounded-lg px-3 py-2 text-sm', isUser ? 'bg-primary text-primary-foreground' : 'bg-slate-800 text-slate-100')}>
        <p className="whitespace-pre-wrap break-words">{message.content}</p>
      </div>
    </div>
  );
}

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

/** Inner chat content used by both CopilotPanel and the resizable wrapper */
function CopilotPanelContent({ context, heading = 'Copilot', onArtifactRefresh, onCollapse }: CopilotPanelProps & { onCollapse?: () => void }) {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, isLoading, sendMessage, hasApp } = useCopilotChat({
    context,
    onArtifactRefresh,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue.trim();
    setInputValue('');
    // Reset textarea height
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

  // Auto-resize textarea
  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }, []);

  return (
    <div className="flex flex-col h-full bg-slate-950 border-r border-slate-800/50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 shrink-0">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-primary" />
          <span className="font-medium text-white text-sm">{heading}</span>
        </div>
        {onCollapse && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onCollapse}
            className="h-7 w-7 text-secondary-foreground hover:text-white hover:bg-slate-800"
            title="Collapse panel"
          >
            <PanelLeftClose className="h-4 w-4" />
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
                {messages.map((msg) => (
                  <CopilotMessageBubble key={msg.id} message={msg} />
                ))}
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
}

/** Collapsible & resizable side-panel chat for split-screen artifact pages */
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

  // On mobile, render a fixed-width panel (no resize)
  if (isMobile) {
    return (
      <div className="w-[380px] shrink-0">
        <CopilotPanelContent
          context={context}
          heading={heading}
          onArtifactRefresh={onArtifactRefresh}
          onCollapse={() => setIsCollapsed(true)}
        />
      </div>
    );
  }

  // On desktop, render a horizontally resizable panel
  return (
    <div
      className="shrink-0 h-full"
      style={{ width: 380, minWidth: 280, maxWidth: 500, resize: 'horizontal', overflow: 'hidden' }}
    >
      <CopilotPanelContent
        context={context}
        heading={heading}
        onArtifactRefresh={onArtifactRefresh}
        onCollapse={() => setIsCollapsed(true)}
      />
    </div>
  );
}

export function ArtifactCopilot({
  context,
  heading = 'Copilot',
  onArtifactRefresh,
  isOpen,
  onToggle,
}: ArtifactCopilotProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { messages, isLoading, sendMessage, hasApp } = useCopilotChat({
    context,
    onArtifactRefresh,
  });

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    if (isOpen && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isOpen]);

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

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  }, []);

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
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/50 shrink-0">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-primary" />
              <span className="font-medium text-white text-sm">{heading}</span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="h-8 w-8 text-white hover:text-white hover:bg-slate-700"
            >
              <X className="h-4 w-4" />
            </Button>
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
                    <p className="text-sm text-primary-foreground">
                      Ask me anything about your {context.replace('_', ' ')}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {messages.map((msg) => (
                      <CopilotMessageBubble key={msg.id} message={msg} />
                    ))}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
