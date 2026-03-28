import { useState } from 'react';
import { Share2, Copy, Check, Trash2, Link, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSharedLinks } from '@/hooks/useSharedLinks';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface ShareDialogProps {
  artifactId: string | undefined;
}

export function ShareDialog({ artifactId }: ShareDialogProps) {
  const { links, isLoading, createLink, deleteLink } = useSharedLinks(artifactId);
  const [permission, setPermission] = useState<'view' | 'comment'>('comment');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCreate = async () => {
    try {
      const link = await createLink.mutateAsync({ permission });
      const url = `${window.location.origin}/shared/${link.token}`;
      await navigator.clipboard.writeText(url);
      toast.success('Share link created and copied!');
    } catch {
      toast.error('Failed to create share link');
    }
  };

  const handleCopy = async (token: string, id: string) => {
    const url = `${window.location.origin}/shared/${token}`;
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success('Link copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteLink.mutateAsync(id);
      toast.success('Link revoked');
    } catch {
      toast.error('Failed to revoke link');
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Share2 className="h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Artifact</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Create new link */}
          <div className="flex items-center gap-2">
            <Select value={permission} onValueChange={(v) => setPermission(v as 'view' | 'comment')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="view">View only</SelectItem>
                <SelectItem value="comment">Can comment</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleCreate}
              disabled={createLink.isPending || !artifactId}
              className="flex-1 gap-2"
            >
              {createLink.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Link className="h-4 w-4" />}
              Create Link
            </Button>
          </div>

          {/* Existing links */}
          {isLoading ? (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : links.length > 0 ? (
            <div className="space-y-2">
              <p className="text-xs font-medium text-muted-foreground">Active links</p>
              {links.map((link) => (
                <div
                  key={link.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-mono text-foreground truncate">
                      /shared/{link.token.slice(0, 8)}…
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {link.permission}{link.expires_at ? ` · Expires ${new Date(link.expires_at).toLocaleDateString()}` : ''}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleCopy(link.token, link.id)}
                    >
                      {copiedId === link.id ? (
                        <Check className="h-4 w-4 text-green-400" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(link.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-2">
              No active share links yet
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
