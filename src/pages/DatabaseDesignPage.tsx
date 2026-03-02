import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useAppIdea } from '@/hooks/useAppIdea';
import { useDatabaseDesign } from '@/hooks/useDatabaseDesign';
import { useArtifact } from '@/hooks/useArtifact';
import { Database, Loader2 } from 'lucide-react';
import { ArtifactCopilot, CopilotToggleButton } from '@/components/artifacts/ArtifactCopilot';
import { motion } from 'framer-motion';
import SchemaVisualizer from '@/components/database/SchemaVisualizer';

interface DatabaseDesignContent {
  erdDiagram?: string;
  tables?: any[];
  relationships?: any[];
}

export default function DatabaseDesignPage() {
  const { appIdea } = useAppIdea();
  const { databaseDesign } = useDatabaseDesign();
  const { data: artifact, loading: artifactLoading } = useArtifact('db_design');
  const [copilotOpen, setCopilotOpen] = useState(false);

  const content: DatabaseDesignContent | null = artifact?.content as DatabaseDesignContent || databaseDesign?.generatedDesign;

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
        </div>
      </div>

      <ArtifactCopilot context="database" heading="DB Architect" isOpen={copilotOpen} onToggle={() => setCopilotOpen(false)} />
    </div>
  );
}