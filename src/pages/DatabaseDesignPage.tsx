import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessCard } from '@/components/ui/business-card';
import { useAppIdea } from '@/hooks/useAppIdea';
import { useDatabaseDesign } from '@/hooks/useDatabaseDesign';
import { useArtifact } from '@/hooks/useArtifact';
import { toast } from 'sonner';
import { Database, Table2, Link2, Loader2, Columns } from 'lucide-react';

import { ArtifactCopilot, CopilotToggleButton } from '@/components/artifacts/ArtifactCopilot';

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
  columns: string[];
}

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

function isNewFormat(table: TableDef): table is TableDefNew {
  return 'columns' in table && Array.isArray(table.columns);
}

function parseColumn(col: string): { name: string; type: string } {
  const match = col.match(/^(.+?)\s*\((.+)\)$/);
  if (match) {
    return { name: match[1].trim(), type: match[2].trim() };
  }
  return { name: col, type: 'unknown' };
}

function parseRelationship(rel: string): { from: string; to: string } {
  const parts = rel.split('->').map(s => s.trim());
  return { from: parts[0] || rel, to: parts[1] || '' };
}

export default function DatabaseDesignPage() {
  const { appIdea } = useAppIdea();
  const { databaseDesign } = useDatabaseDesign();
  const { data: artifact, loading: artifactLoading } = useArtifact('db_design');
  const [copilotOpen, setCopilotOpen] = useState(false);
  
  const [roadmapFeatures, setRoadmapFeatures] = useState(databaseDesign?.roadmapFeatures || '');

  useEffect(() => {
    if (databaseDesign) {
      setRoadmapFeatures(databaseDesign.roadmapFeatures || '');
    }
  }, [databaseDesign]);

  const content: DatabaseDesignContent | null = artifact?.content as DatabaseDesignContent || databaseDesign?.generatedDesign;

  if (artifactLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="relative h-dvh flex flex-col overflow-hidden">
      <div className="overflow-auto flex-1">
        <div className="max-w-full space-y-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Database Design</h1>
              <p className="text-muted-foreground mt-1">ERD and table schema for your app</p>
            </div>
            <CopilotToggleButton heading="DB Architect" onClick={() => setCopilotOpen(v => !v)} />
          </div>

          {/* Empty State */}
          {!content && (
            <Card className="bg-card border-slate-700/50">
              <CardContent className="p-8 text-center">
                <Database className="w-12 h-12 mx-auto text-secondary-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">No Database Design Yet</h3>
                <p className="text-secondary-foreground text-base">
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
              {content.tables && content.tables.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                    <Table2 className="w-5 h-5 text-primary" />
                    Tables & Fields
                  </h2>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {content.tables.map((table, i) => (
                      <BusinessCard 
                        key={i} 
                        title={table.name}
                        icon={Columns}
                        iconColor="text-primary"
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
                              table.columns.map((col, j) => {
                                const { name, type } = parseColumn(col);
                                return (
                                  <TableRow key={j} className="border-white/10 hover:bg-white/5">
                                    <TableCell className="text-sm font-mono text-secondary-foreground">{name}</TableCell>
                                    <TableCell className="text-sm font-mono text-secondary-foreground">{type}</TableCell>
                                  </TableRow>
                                );
                              })
                            ) : (
                              (table as TableDefLegacy).fields.map((field, j) => (
                                <TableRow key={j} className="border-white/10 hover:bg-white/5">
                                  <TableCell className="text-sm font-mono text-secondary-foreground">{field.name}</TableCell>
                                  <TableCell className="text-sm font-mono text-secondary-foreground">
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

              {content.relationships && content.relationships.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                    <Link2 className="w-5 h-5 text-primary" />
                    Table Relationships
                  </h2>
                  <BusinessCard 
                    title="Relationships"
                    icon={Link2}
                    iconColor="text-primary"
                  >
                    {typeof content.relationships[0] === 'string' ? (
                      <ul className="space-y-3">
                        {(content.relationships as string[]).map((rel, i) => {
                          const { from, to } = parseRelationship(rel);
                          return (
                            <li key={i} className="flex items-center gap-2">
                              <span className="font-mono text-white">{from}</span>
                              <span className="text-primary font-bold">→</span>
                              <span className="font-mono text-white">{to}</span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : (
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
                              <TableCell className="text-sm font-mono text-secondary-foreground">{rel.from}</TableCell>
                              <TableCell className="text-sm font-mono text-secondary-foreground">{rel.to}</TableCell>
                              <TableCell className="text-sm">
                                <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-xs">
                                  {rel.type}
                                </span>
                              </TableCell>
                              <TableCell className="text-sm text-secondary-foreground">{rel.description || '-'}</TableCell>
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

      <ArtifactCopilot context="database" heading="DB Architect" isOpen={copilotOpen} onToggle={() => setCopilotOpen(false)} />
    </div>
  );
}
