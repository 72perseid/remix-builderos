import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCopilotChat, CopilotMessage } from '@/hooks/useCopilotChat';
import { MessageSquare, Send, Loader2, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface ArtifactCopilotProps {
  context: string;
  heading?: string;
  onArtifactRefresh?: () => void;
  isOpen: boolean;
  onToggle: () => void;
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

export function ArtifactCopilot({
  context,
  heading = 'Copilot',
  onArtifactRefresh,
  isOpen,
  onToggle,
}: ArtifactCopilotProps) {
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
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
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    const message = inputValue.trim();
    setInputValue('');
    await sendMessage(message);
  };

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
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Ask a question..."
                    className="flex-1 bg-slate-900 border-slate-700 text-white placeholder:text-slate-500 text-sm"
                    disabled={isLoading}
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
