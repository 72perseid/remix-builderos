import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChatSheet } from './ChatSheet';
import { Sparkles } from 'lucide-react';

export function ChatFAB() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        size="icon"
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50 bg-primary hover:bg-primary/90"
      >
        <Sparkles className="h-6 w-6" />
      </Button>
      <ChatSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
