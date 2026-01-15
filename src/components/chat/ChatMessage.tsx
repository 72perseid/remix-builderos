import { cn } from '@/lib/utils';
import { User, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import builderosIconMono from '@/assets/builderos-icon-mono.png';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
  userAvatar?: string | null;
}

// Transform special system messages to user-friendly content
function transformContent(content: string): { text: string; isComplete: boolean } {
  if (content.includes('JSON_GENERATION_COMPLETE')) {
    return {
      text: '✨ BuilderOS completed your artifacts! Head to the dashboard to view them.',
      isComplete: true,
    };
  }
  return { text: content, isComplete: false };
}

export function ChatMessage({ role, content, timestamp, userAvatar }: ChatMessageProps) {
  const isUser = role === 'user';
  const { text, isComplete } = transformContent(content);

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      {isUser ? (
        <Avatar className="w-8 h-8 flex-shrink-0">
          <AvatarImage src={userAvatar || undefined} alt="User" />
          <AvatarFallback className="bg-primary/20">
            <User className="w-4 h-4 text-primary" />
          </AvatarFallback>
        </Avatar>
      ) : (
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-accent/20">
          <img src={builderosIconMono} alt="BuilderOS" className="w-5 h-5" />
        </div>
      )}
      <div
        className={cn(
          'max-w-[80%] rounded-2xl px-4 py-2',
          isUser
            ? 'bg-primary text-primary-foreground rounded-br-md'
            : 'bg-muted text-foreground rounded-bl-md'
        )}
      >
        <p className="text-sm whitespace-pre-wrap">{text}</p>
        {isComplete && (
          <Link 
            to="/dashboard" 
            className="inline-flex items-center gap-1.5 mt-2 text-sm font-medium text-primary hover:underline"
          >
            <CheckCircle className="w-4 h-4" />
            Go to Dashboard
          </Link>
        )}
        {timestamp && (
          <p className="text-[10px] opacity-60 mt-1">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </p>
        )}
      </div>
    </div>
  );
}
