import { useState, useRef, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from './ChatMessage';
import { useChat } from '@/hooks/useChat';
import { useChatContext } from '@/contexts/ChatContext';
import { useProfile } from '@/hooks/useProfile';
import { Send, Loader2 } from 'lucide-react';

interface ChatSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChatSheet({ open, onOpenChange }: ChatSheetProps) {
  const { messages, loading, isStreaming, sendMessage, clearChat } = useChat();
  const { shouldClearOnOpen, setShouldClearOnOpen } = useChatContext();
  const { profile } = useProfile();
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  // Clear chat when opened with shouldClearOnOpen flag (New App flow)
  useEffect(() => {
    if (open && shouldClearOnOpen) {
      clearChat();
      setShouldClearOnOpen(false);
    }
  }, [open, shouldClearOnOpen, clearChat, setShouldClearOnOpen]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isStreaming]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    const message = input.trim();
    setInput('');
    await sendMessage(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md flex flex-col p-0 bg-[#0f1219] border-slate-800">
        <SheetHeader className="px-4 py-3 border-b border-slate-800">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-lg text-white">BuilderOS</SheetTitle>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          {loading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center text-slate-400 py-8">
              <p className="text-sm">Start a conversation with BuilderOS.</p>
              <p className="text-xs mt-1 text-slate-500">Ask about your app, features, or get help building.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((msg) => (
                <ChatMessage
                  key={msg.id}
                  role={msg.role as 'user' | 'assistant'}
                  content={msg.content}
                  timestamp={msg.created_at}
                  userAvatar={profile?.profile_image}
                  onDashboardClick={() => onOpenChange(false)}
                />
              ))}
              {isStreaming && (
                <div className="flex gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-blue-500/20">
                    <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
                  </div>
                  <div className="bg-slate-800 rounded-2xl rounded-bl-md px-4 py-2">
                    <p className="text-sm text-slate-300">Thinking...</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        <div className="p-4 border-t border-slate-800">
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              disabled={isStreaming}
              className="flex-1 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus-visible:ring-blue-500"
            />
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isStreaming}
              size="icon"
              className="bg-white text-black hover:bg-slate-200"
            >
              {isStreaming ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
