import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useArtifact } from '@/hooks/useArtifact';
import { Database, Loader2, Copy, Check, Lock, Sparkles } from 'lucide-react';
import { ArtifactCopilot, CopilotToggleButton } from '@/components/artifacts/ArtifactCopilot';
import { CoachCTA } from '@/components/dashboard/CoachCTA';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import SchemaVisualizer from '@/components/database/SchemaVisualizer';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface DatabaseDesignContent {
  erdDiagram?: string;
  tables?: any[];
  relationships?: any[];
  sql?: string;
  schema?: {
    tables?: any[];
    relationships?: any[];
  };
}

function DatabaseDesignPageInner() {
  const { data: artifact, loading: artifactLoading } = useArtifact('db_design');
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const navigate = useNavigate();
  const { buildAccess } = useEnrollment();
  const { isAdmin } = useIsAdmin();
  const isLocked = !isAdmin && !buildAccess;

  // Single source of truth: artifacts table
  const content: DatabaseDesignContent | null = artifact?.content as DatabaseDesignContent || null;
  const tables = content?.schema?.tables || content?.tables || [];
  const rels = content?.schema?.relationships || content?.relationships || [];
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
      <div className={cn("overflow-auto flex-1", isLocked && "blur-md select-none pointer-events-none")} aria-hidden={isLocked}>
        <div className="max-w-full space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Database Design</h1>
              <p className="text-muted-foreground mt-1">ERD and table schema for your app</p>
            </div>
            <CopilotToggleButton heading="DB Architect" onClick={() => setCopilotOpen(v => !v)} />
          </div>

          {/* Empty State */}
          {tables.length === 0 && !sqlContent && (
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
          {tables.length > 0 && (
            <motion.div
              id="artifact-export-area"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <SchemaVisualizer
                tables={tables}
                relationships={rels}
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

          {/* Coach CTA */}
          <CoachCTA message="Need help deploying this?" ctaLabel="Talk to an Expert" />
        </div>
      </div>

      {isLocked && (
        <div className="absolute inset-0 flex items-center justify-center z-20 p-6">
          <div className="bg-card/95 backdrop-blur border border-slate-700/50 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
              <div className="relative">
                <Sparkles className="h-7 w-7 text-primary" />
                <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-primary bg-background rounded-full p-0.5" />
              </div>
            </div>
            <h2 className="text-center text-xl font-semibold text-foreground mb-1.5">
              Unlock the Builder Suite
            </h2>
            <p className="text-center text-sm text-muted-foreground mb-4">
              Get full access to the AI-powered planning and building tools to ship your app faster.
            </p>
            <ul className="space-y-2.5 mb-5">
              {[
                "Project board & task automation",
                "Business model, validation & product brief artifacts",
                "Database design & master prompt generator",
              ].map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
            <Button onClick={() => navigate('/coaching')} className="w-full">
              Talk to an Expert
            </Button>
          </div>
        </div>
      )}

      <ArtifactCopilot context="database" heading="DB Architect" isOpen={copilotOpen} onToggle={() => setCopilotOpen(false)} />
    </div>
  );
}