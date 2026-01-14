import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import logoIcon from '@/assets/logo-icon-assistant.png';

interface OnboardingMessageProps {
  role: 'user' | 'assistant';
  content: string;
  isNew?: boolean;
}

export function OnboardingMessage({ role, content, isNew = false }: OnboardingMessageProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        'flex gap-4 w-full animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        isUser ? 'justify-end' : 'justify-start'
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg overflow-hidden">
          <img src={logoIcon} alt="Architect" className="w-6 h-6 object-contain" />
        </div>
      )}

      <div
        className={cn(
          'max-w-[75%] rounded-2xl px-5 py-4 shadow-md',
          isUser
            ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-br-md'
            : 'bg-card border border-border text-foreground rounded-bl-md'
        )}
      >
        {!isUser && (
          <p className="text-xs font-semibold text-blue-400 mb-1.5 uppercase tracking-wide">
            Architect
          </p>
        )}
        <p className="text-base leading-relaxed whitespace-pre-wrap">{content}</p>
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg">
          <User className="w-5 h-5 text-white" />
        </div>
      )}
    </div>
  );
}
