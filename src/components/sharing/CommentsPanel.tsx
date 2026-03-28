import { useState } from 'react';
import { MessageSquare, Send, Trash2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useArtifactComments, ArtifactComment } from '@/hooks/useArtifactComments';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface CommentsPanelProps {
  artifactId: string | undefined;
  className?: string;
}

export function CommentsPanel({ artifactId, className }: CommentsPanelProps) {
  const { user } = useAuth();
  const { comments, isLoading, addComment, deleteComment } = useArtifactComments(artifactId);
  const [text, setText] = useState('');
  const [guestName, setGuestName] = useState('');

  const handleSubmit = async () => {
    if (!text.trim()) return;
    try {
      await addComment.mutateAsync({ comment: text.trim(), guestName: guestName.trim() || undefined });
      setText('');
    } catch {
      // error handled by mutation
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit();
    }
  };

  return (
    <div className={cn('flex flex-col border-l border-border bg-card/50', className)}>
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <MessageSquare className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          Feedback ({comments.length})
        </h3>
      </div>

      {/* Comments list */}
      <div className="flex-1 overflow-auto p-4 space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No comments yet. Be the first to leave feedback!
          </p>
        ) : (
          comments.map((c) => (
            <CommentBubble
              key={c.id}
              comment={c}
              isOwn={c.user_id === user?.id}
              onDelete={() => deleteComment.mutate(c.id)}
            />
          ))
        )}
      </div>

      {/* Input area */}
      <div className="border-t border-border p-3 space-y-2">
        {!user && (
          <Input
            placeholder="Your name"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="text-sm"
          />
        )}
        <div className="flex gap-2">
          <Textarea
            placeholder="Leave feedback… (Ctrl+Enter to send)"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="text-sm min-h-[60px] resize-none flex-1"
            rows={2}
          />
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!text.trim() || addComment.isPending}
            className="shrink-0 self-end"
          >
            {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function CommentBubble({
  comment: c,
  isOwn,
  onDelete,
}: {
  comment: ArtifactComment;
  isOwn: boolean;
  onDelete: () => void;
}) {
  const displayName = c.guest_name || (c.user_id ? 'You' : 'Anonymous');
  return (
    <div className="group rounded-lg bg-muted/40 border border-border/50 p-3 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-foreground">{displayName}</span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {new Date(c.created_at).toLocaleDateString()}
          </span>
          {isOwn && (
            <button
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive/80"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>
      <p className="text-sm text-foreground/90 whitespace-pre-wrap">{c.comment}</p>
    </div>
  );
}
