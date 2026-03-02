import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAppIdea } from '@/hooks/useAppIdea';
import { useDatabaseDesign } from '@/hooks/useDatabaseDesign';
import { useArtifact } from '@/hooks/useArtifact';
import { Database, Loader2, Copy, Check } from 'lucide-react';
import { ArtifactCopilot, CopilotToggleButton } from '@/components/artifacts/ArtifactCopilot';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import SchemaVisualizer from '@/components/database/SchemaVisualizer';

interface DatabaseDesignContent {
  erdDiagram?: string;
  tables?: any[];
  relationships?: any[];
  sql?: string;
}

export default function DatabaseDesignPage() {
  const { appIdea } = useAppIdea();
  const { databaseDesign } = useDatabaseDesign();
  const { data: artifact, loading: artifactLoading } = useArtifact('db_design');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const content: DatabaseDesignContent | null = artifact?.content as DatabaseDesignContent || databaseDesign?.generatedDesign;
  const sqlContent = content?.sql || null;

  const handleCopy = async () => {
    if (!sqlContent) return;
    try {
      await navigator.clipboard.writeText(sqlContent);
      setCopied(true);
      toast.success('SQL copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  if (artifactLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="relative h-dvh flex flex-col overflow-hidden">
      <div className="overflow-auto flex-1">
        <div className="max-w-full space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Database Design</h1>
              <p className="text-muted-foreground mt-1">ERD and table schema for your app</p>
            </div>
            <CopilotToggleButton heading="DB Architect" onClick={() => setCopilotOpen(v => !v)} />
          </div>

          {/* Empty State */}
          {!content && (
            <Card className="bg-card border-border">
              <CardContent className="p-8 text-center">
                <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">No Database Design Yet</h3>
                <p className="text-muted-foreground text-base">
                  Generate a database design using the AI Architect on the Dashboard.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Schema Visualizer */}
          {content && content.tables && content.tables.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SchemaVisualizer
                tables={content.tables}
                relationships={content.relationships || []}
              />
            </motion.div>
          )}

          {/* SQL Panel */}
          {sqlContent && (
            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-foreground">SQL Schema</h2>
                <Button
                  size="sm"
                  onClick={handleCopy}
                  className={cn(
                    "gap-2 rounded-full transition-colors",
                    copied
                      ? "bg-green-500/20 border-green-500/50 text-green-400"
                      : "bg-primary hover:bg-primary/90 text-primary-foreground"
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copy SQL
                    </>
                  )}
                </Button>
              </div>

              <div className="relative group">
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleCopy}
                    className={cn(
                      "h-8 w-8",
                      copied && "bg-green-500/20 border-green-500/50"
                    )}
                  >
                    {copied ? (
                      <Check className="w-4 h-4 text-green-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </Button>
                </div>

                <pre className="bg-card border border-border rounded-xl p-6 overflow-auto max-h-[60vh] text-sm text-muted-foreground font-mono whitespace-pre-wrap leading-relaxed">
                  {sqlContent}
                </pre>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Copy this SQL and run it in your Supabase SQL editor or any database tool.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      <ArtifactCopilot context="database" heading="DB Architect" isOpen={copilotOpen} onToggle={() => setCopilotOpen(false)} />
    </div>
  );
}