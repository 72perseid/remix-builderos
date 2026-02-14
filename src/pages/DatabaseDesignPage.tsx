import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessCard } from '@/components/ui/business-card';
import { useAppIdea } from '@/hooks/useAppIdea';
import { useDatabaseDesign } from '@/hooks/useDatabaseDesign';
import { useArtifact } from '@/hooks/useArtifact';
import { toast } from 'sonner';
import { Database, Table2, Link2, Loader2, Columns } from 'lucide-react';
import { ArtifactBackButton } from '@/components/dashboard/ArtifactBackButton';
import { ArtifactCopilot } from '@/components/artifacts/ArtifactCopilot';
import { motion } from 'framer-motion';
import {
  Table as UITable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// New format from DB - columns as string array
interface TableDefNew {
  name: string;
  columns: string[]; // e.g. ["id (uuid)", "email (text)"]
}

// Legacy format - columns as objects
interface TableField {
  name: string;
  type: string;
  constraints?: string;
}

interface TableDefLegacy {
  name: string;
  fields: TableField[];
}

type TableDef = TableDefNew | TableDefLegacy;

interface DatabaseDesignContent {
  erdDiagram?: string;
  tables?: TableDef[];
  relationships?: string[] | { from: string; to: string; type: string; description?: string }[];
}

// Helper to check if table uses new format
function isNewFormat(table: TableDef): table is TableDefNew {
  return 'columns' in table && Array.isArray(table.columns);
}

// Helper to parse column string like "id (uuid)" into name and type
function parseColumn(col: string): { name: string; type: string } {
  const match = col.match(/^(.+?)\s*\((.+)\)$/);
  if (match) {
    return { name: match[1].trim(), type: match[2].trim() };
  }
  return { name: col, type: 'unknown' };
}

// Helper to parse relationship string like "users.id -> children.user_id"
function parseRelationship(rel: string): { from: string; to: string } {
  const parts = rel.split('->').map(s => s.trim());
  return { from: parts[0] || rel, to: parts[1] || '' };
}

export default function DatabaseDesignPage() {
  const { appIdea } = useAppIdea();
  const { databaseDesign } = useDatabaseDesign();
  const { data: artifact, loading: artifactLoading } = useArtifact('db_design');
  
  const [roadmapFeatures, setRoadmapFeatures] = useState(databaseDesign?.roadmapFeatures || '');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (databaseDesign) {
      setRoadmapFeatures(databaseDesign.roadmapFeatures || '');
    }
  }, [databaseDesign]);

  const handleGenerate = async () => {
    if (!appIdea?.appDescription) {
      toast.error('Please save your app idea first');
      return;
    }

    setIsGenerating(true);
    
    setTimeout(() => {
      setIsGenerating(false);
      toast.info('AI generation not yet configured');
    }, 1000);
  };

  // Use artifact content if available, otherwise fall back to local hook
  const content: DatabaseDesignContent | null = artifact?.content as DatabaseDesignContent || databaseDesign?.generatedDesign;

  if (artifactLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="flex h-full bg-[#0B0E14] min-h-screen">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6 p-6">
          <ArtifactBackButton />
          <div>
            <h1 className="text-2xl font-bold text-white">Database Design</h1>
            <p className="text-muted-foreground mt-1">ERD and table schema for your app</p>
          </div>

          {/* Empty State */}
          {!content && (
            <Card className="bg-[#161e2a] border-slate-700/50">
              <CardContent className="p-8 text-center">
                <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">No Database Design Yet</h3>
                <p className="text-muted-foreground text-base">
                  Generate a database design using the AI Architect on the Dashboard.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Generated Database Design */}
          {content && (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Tables */}
              {content.tables && content.tables.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                    <Table2 className="w-5 h-5 text-purple-500" />
                    Tables & Fields
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {content.tables.map((table, i) => (
                      <BusinessCard 
                        key={i} 
                        title={table.name}
                        icon={Columns}
                        iconColor="text-purple-500"
                      >
                        <UITable>
                          <TableHeader>
                            <TableRow className="border-white/10 hover:bg-transparent">
                              <TableHead className="text-sm text-white font-medium">Field</TableHead>
                              <TableHead className="text-sm text-white font-medium">Type</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {isNewFormat(table) ? (
                              // New format: columns as string array
                              table.columns.map((col, j) => {
                                const { name, type } = parseColumn(col);
                                return (
                                  <TableRow key={j} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="text-sm font-mono text-muted-foreground">{name}</TableCell>
                                    <TableCell className="text-sm font-mono text-muted-foreground">{type}</TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              // Legacy format: fields as objects
                              (table as TableDefLegacy).fields.map((field, j) => (
                                <TableRow key={j} className="border-white/10 hover:bg-white/5">
                                  <TableCell className="text-sm font-mono text-muted-foreground">{field.name}</TableCell>
                                  <TableCell className="text-sm font-mono text-muted-foreground">
                                    {field.type}
                                    {field.constraints && ` (${field.constraints})`}
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </UITable>
                      </BusinessCard>
                    ))}
                  </div>
                </div>
              )}

              {/* Relationships */}
              {content.relationships && content.relationships.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                    <Link2 className="w-5 h-5 text-orange-500" />
                    Table Relationships
                  </h2>
                  <BusinessCard 
                    title="Relationships"
                    icon={Link2}
                    iconColor="text-orange-500"
                  >
                    {typeof content.relationships[0] === 'string' ? (
                      // New format: relationships as string array
                      <ul className="space-y-3">
                        {(content.relationships as string[]).map((rel, i) => {
                          const { from, to } = parseRelationship(rel);
                          return (
                            <li key={i} className="flex items-center gap-2">
                              <span className="font-mono text-white">{from}</span>
                              <span className="text-orange-500 font-bold">→</span>
                              <span className="font-mono text-white">{to}</span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
                      // Legacy format: relationships as objects
                      <UITable>
                        <TableHeader>
                          <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-sm text-white font-medium">From</TableHead>
                            <TableHead className="text-sm text-white font-medium">To</TableHead>
                            <TableHead className="text-sm text-white font-medium">Type</TableHead>
                            <TableHead className="text-sm text-white font-medium">Description</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {(content.relationships as { from: string; to: string; type: string; description?: string }[]).map((rel, i) => (
                            <TableRow key={i} className="border-white/10 hover:bg-white/5">
                              <TableCell className="text-sm font-mono text-muted-foreground">{rel.from}</TableCell>
                              <TableCell className="text-sm font-mono text-muted-foreground">{rel.to}</TableCell>
                              <TableCell className="text-sm">
                                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                                  {rel.type}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">{rel.description || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </UITable>
                    )}
                  </BusinessCard>
                </div>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Copilot Sidebar */}
      <ArtifactCopilot context="database" heading="DB Architect" />
    </div>
  );
}
