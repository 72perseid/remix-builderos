import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
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

interface TableField {
  name: string;
  type: string;
  constraints?: string;
}

interface TableDef {
  name: string;
  fields: TableField[];
}

interface Relationship {
  from: string;
  to: string;
  type: string;
  description?: string;
}

interface DatabaseDesignContent {
  erdDiagram?: string;
  tables?: TableDef[];
  relationships?: Relationship[];
}

export default function DatabaseDesignPage() {
  const { appIdea } = useAppIdea();
  const { databaseDesign, saveDatabaseDesign, updateGeneratedContent } = useDatabaseDesign();
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
    
    // TODO: Replace with actual n8n webhook call
    setTimeout(() => {
      setIsGenerating(false);
      toast.info('AI generation not yet configured');
    }, 1000);
  };

  // Use artifact content if available, otherwise fall back to local hook
  const content: DatabaseDesignContent | null = artifact?.content as DatabaseDesignContent || databaseDesign?.generatedDesign;

  if (artifactLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Database Design</h1>
          <p className="text-muted-foreground mt-1">Generate an ERD and table schema for your app</p>
        </div>

        {/* Input Form */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Design Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <Label className="text-xs text-muted-foreground">App Description (from saved)</Label>
              <p className="text-sm mt-1">{appIdea?.appDescription || 'No app idea saved yet'}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="roadmapFeatures">App Roadmap & Features</Label>
              <Textarea
                id="roadmapFeatures"
                value={roadmapFeatures}
                onChange={(e) => setRoadmapFeatures(e.target.value)}
                placeholder="List the main features and functionality your app needs. Include user flows, data relationships, and any specific requirements..."
                rows={5}
              />
            </div>
            
            <Button onClick={handleGenerate} disabled={isGenerating}>
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Database Design'}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Database Design */}
        {content && (
          <div className="space-y-6 animate-fade-in">
            {/* ERD Diagram */}
            {content.erdDiagram && (
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Database className="w-4 h-4 text-primary" />
                    ERD Diagram (Mermaid)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <pre className="p-4 rounded-lg bg-muted/50 border border-border/50 overflow-x-auto text-xs font-mono">
                    {content.erdDiagram}
                  </pre>
                </CardContent>
              </Card>
            )}

            {/* Tables */}
            {content.tables && content.tables.length > 0 && (
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Table className="w-4 h-4 text-accent" />
                    Tables & Fields
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {content.tables.map((table, i) => (
                    <div key={i} className="space-y-2">
                      <h4 className="font-semibold text-sm">{table.name}</h4>
                      <UITable>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="text-xs">Field</TableHead>
                            <TableHead className="text-xs">Type</TableHead>
                            <TableHead className="text-xs">Constraints</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {table.fields.map((field, j) => (
                            <TableRow key={j}>
                              <TableCell className="text-xs font-mono">{field.name}</TableCell>
                              <TableCell className="text-xs font-mono text-muted-foreground">{field.type}</TableCell>
                              <TableCell className="text-xs text-muted-foreground">{field.constraints || '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </UITable>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Relationships */}
            {content.relationships && content.relationships.length > 0 && (
              <Card className="glass">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Link2 className="w-4 h-4 text-category-stretch" />
                    Table Relationships
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <UITable>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-xs">From</TableHead>
                        <TableHead className="text-xs">To</TableHead>
                        <TableHead className="text-xs">Type</TableHead>
                        <TableHead className="text-xs">Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {content.relationships.map((rel, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-xs font-mono">{rel.from}</TableCell>
                          <TableCell className="text-xs font-mono">{rel.to}</TableCell>
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
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
