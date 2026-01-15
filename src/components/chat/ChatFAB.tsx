import { Button } from '@/components/ui/button';
import { ChatSheet } from './ChatSheet';
import { useChatContext } from '@/contexts/ChatContext';
import builderosIcon from '@/assets/builderos-icon.png';

export function ChatFAB() {
  const { isOpen, openChat, closeChat } = useChatContext();

  return (
    <>
      <Button
        onClick={openChat}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-[#0f1219] hover:bg-[#1a1f2e] border border-slate-700"
      >
        <img src={builderosIcon} alt="BuilderOS" className="h-8 w-8" />
      </Button>
      <ChatSheet open={isOpen} onOpenChange={(open) => open ? openChat() : closeChat()} />
    </>
  );
}
