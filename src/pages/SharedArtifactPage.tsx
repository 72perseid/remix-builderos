import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useSharedLinkByToken } from '@/hooks/useSharedLinks';
import { CommentsPanel } from '@/components/sharing/CommentsPanel';
import { Loader2, Lock, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessCard } from '@/components/ui/business-card';
import { motion } from 'framer-motion';

const ARTIFACT_LABELS: Record<string, string> = {
  business_model: 'Business Model',
  validation: 'User Validation',
  product_brief: 'Product Brief',
  ui_ux: 'UI/UX Design',
  db_design: 'Database Design',
  kanban: 'Kanban Board',
  master_prompt: 'Master Prompt',
};

export default function SharedArtifactPage() {
  const { token } = useParams<{ token: string }>();
  const { data: sharedLink, isLoading: linkLoading } = useSharedLinkByToken(token);

  const { data: artifact, isLoading: artifactLoading } = useQuery({
    queryKey: ['shared-artifact', sharedLink?.artifact_id],
    queryFn: async () => {
      if (!sharedLink?.artifact_id) return null;
      const { data, error } = await supabase
        .from('artifacts')
        .select('*')
        .eq('id', sharedLink.artifact_id)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!sharedLink?.artifact_id,
  });

  if (linkLoading || artifactLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!sharedLink) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background gap-4">
        <Lock className="w-12 h-12 text-muted-foreground" />
        <h1 className="text-xl font-bold text-foreground">Link expired or invalid</h1>
        <p className="text-muted-foreground">This shared link is no longer available.</p>
      </div>
    );
  }

  const content = artifact?.content as Record<string, unknown> | null;
  const artifactType = artifact?.type || 'unknown';
  const label = ARTIFACT_LABELS[artifactType] || artifactType;
  const canComment = sharedLink.permission === 'comment';

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="border-b border-border px-6 py-4 bg-card/50">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <FileText className="h-5 w-5 text-primary" />
          <div>
            <h1 className="text-lg font-bold text-foreground">{label}</h1>
            <p className="text-xs text-muted-foreground">
              Shared artifact · {canComment ? 'You can leave feedback' : 'View only'}
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Content */}
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-4xl mx-auto">
            {content ? (
              <motion.div
                className="grid md:grid-cols-2 gap-4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                {Object.entries(content).map(([key, value]) => {
                  if (value === null || value === undefined) return null;
                  const heading = key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
                  return (
                    <Card key={key} className="bg-card border-border col-span-1 md:col-span-2">
                      <CardContent className="p-5">
                        <h3 className="text-sm font-semibold text-primary mb-2">{heading}</h3>
                        <div className="text-sm text-foreground/90">
                          {typeof value === 'string' ? (
                            <p>{value}</p>
                          ) : Array.isArray(value) ? (
                            <ul className="space-y-1">
                              {value.map((item, i) => (
                                <li key={i} className="flex gap-2">
                                  <span className="text-primary">•</span>
                                  {typeof item === 'string' ? item : JSON.stringify(item)}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <pre className="text-xs whitespace-pre-wrap text-muted-foreground">
                              {JSON.stringify(value, null, 2)}
                            </pre>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </motion.div>
            ) : (
              <Card className="bg-card border-border">
                <CardContent className="p-8 text-center">
                  <p className="text-muted-foreground">No content available</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Comments sidebar */}
        {canComment && (
          <CommentsPanel
            artifactId={sharedLink.artifact_id}
            className="w-80 shrink-0 hidden md:flex"
          />
        )}
      </div>
    </div>
  );
}
