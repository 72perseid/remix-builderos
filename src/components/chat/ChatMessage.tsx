import { cn } from '@/lib/utils';
import { User, Sparkles, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string;
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

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === 'user';
  const { text, isComplete } = transformContent(content);

  return (
    <div className={cn('flex gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
          isUser ? 'bg-primary/20' : 'bg-accent/20'
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-primary" />
        ) : (
          <Sparkles className="w-4 h-4 text-accent" />
        )}
      </div>
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
