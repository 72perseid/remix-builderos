import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAppIdea } from '@/hooks/useAppIdea';
import { useDatabaseDesign } from '@/hooks/useDatabaseDesign';
import { useArtifact } from '@/hooks/useArtifact';
import { toast } from 'sonner';
import { Sparkles, Database, Table, Link2, Loader2 } from 'lucide-react';
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
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Database Design</h1>
        <p className="text-muted-foreground mt-1">Generate an ERD and table schema for your app</p>
      </div>


      {/* Empty State */}
      {!content && (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-8 text-center">
            <Database className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No Database Design Yet</h3>
            <p className="text-muted-foreground text-sm">
              Generate a database design using the AI Architect on the Dashboard.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Generated Database Design */}
      {content && (
        <div className="space-y-6 animate-fade-in">
          {/* ERD Diagram */}
          {content.erdDiagram && (
            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <Database className="w-4 h-4 text-primary" />
                  ERD Diagram (Mermaid)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-lg bg-background/50 border border-border overflow-x-auto text-xs font-mono text-foreground/80">
                  {content.erdDiagram}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Tables */}
          {content.tables && content.tables.length > 0 && (
            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <Table className="w-4 h-4 text-purple-500" />
                  Tables & Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.tables.map((table, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="font-semibold text-sm text-foreground">{table.name}</h4>
                    <UITable>
                      <TableHeader>
                        <TableRow className="border-border">
                          <TableHead className="text-xs text-muted-foreground">Field</TableHead>
                          <TableHead className="text-xs text-muted-foreground">Type</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {isNewFormat(table) ? (
                          // New format: columns as string array
                          table.columns.map((col, j) => {
                            const { name, type } = parseColumn(col);
                            return (
                              <TableRow key={j} className="border-border">
                                <TableCell className="text-xs font-mono text-foreground/80">{name}</TableCell>
                                <TableCell className="text-xs font-mono text-muted-foreground">{type}</TableCell>
                              </TableRow>
                            );
                          })
                        ) : (
                          // Legacy format: fields as objects
                          (table as TableDefLegacy).fields.map((field, j) => (
                            <TableRow key={j} className="border-border">
                              <TableCell className="text-xs font-mono text-foreground/80">{field.name}</TableCell>
                              <TableCell className="text-xs font-mono text-muted-foreground">
                                {field.type}
                                {field.constraints && ` (${field.constraints})`}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </UITable>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Relationships */}
          {content.relationships && content.relationships.length > 0 && (
            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-foreground">
                  <Link2 className="w-4 h-4 text-orange-500" />
                  Table Relationships
                </CardTitle>
              </CardHeader>
              <CardContent>
                {typeof content.relationships[0] === 'string' ? (
                  // New format: relationships as string array
                  <ul className="space-y-2">
                    {(content.relationships as string[]).map((rel, i) => {
                      const { from, to } = parseRelationship(rel);
                      return (
                        <li key={i} className="text-sm text-muted-foreground flex items-center gap-2">
                          <span className="font-mono text-foreground/80">{from}</span>
                          <span className="text-orange-500">→</span>
                          <span className="font-mono text-foreground/80">{to}</span>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  // Legacy format: relationships as objects
                  <UITable>
                    <TableHeader>
                      <TableRow className="border-border">
                        <TableHead className="text-xs text-muted-foreground">From</TableHead>
                        <TableHead className="text-xs text-muted-foreground">To</TableHead>
                        <TableHead className="text-xs text-muted-foreground">Type</TableHead>
                        <TableHead className="text-xs text-muted-foreground">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(content.relationships as { from: string; to: string; type: string; description?: string }[]).map((rel, i) => (
                        <TableRow key={i} className="border-border">
                          <TableCell className="text-xs font-mono text-foreground/80">{rel.from}</TableCell>
                          <TableCell className="text-xs font-mono text-foreground/80">{rel.to}</TableCell>
                          <TableCell className="text-xs">
                            <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[10px]">
                              {rel.type}
                            </span>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">{rel.description || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </UITable>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
