import { Button } from '@/components/ui/button';
import { ChatSheet } from './ChatSheet';
import { Sparkles } from 'lucide-react';
import { useChatContext } from '@/contexts/ChatContext';

export function ChatFAB() {
  const { isOpen, openChat, closeChat } = useChatContext();

  return (
    <>
      <Button
        onClick={openChat}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
      <ChatSheet open={isOpen} onOpenChange={(open) => open ? openChat() : closeChat()} />
    </>
  );
}
