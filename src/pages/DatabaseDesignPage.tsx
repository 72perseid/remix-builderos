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
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Database Design</h1>
        <p className="text-slate-400 mt-1">Generate an ERD and table schema for your app</p>
      </div>

      {/* Input Form */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Design Context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
            <Label className="text-xs text-slate-400">App Description (from saved)</Label>
            <p className="text-sm mt-1 text-slate-300">{appIdea?.appDescription || 'No app idea saved yet'}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="roadmapFeatures" className="text-slate-300">App Roadmap & Features</Label>
            <Textarea
              id="roadmapFeatures"
              value={roadmapFeatures}
              onChange={(e) => setRoadmapFeatures(e.target.value)}
              placeholder="List the main features and functionality your app needs. Include user flows, data relationships, and any specific requirements..."
              rows={5}
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          
          <Button onClick={handleGenerate} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700">
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
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <Database className="w-4 h-4 text-blue-500" />
                  ERD Diagram (Mermaid)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="p-4 rounded-lg bg-slate-900/50 border border-slate-700 overflow-x-auto text-xs font-mono text-slate-300">
                  {content.erdDiagram}
                </pre>
              </CardContent>
            </Card>
          )}

          {/* Tables */}
          {content.tables && content.tables.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <Table className="w-4 h-4 text-purple-500" />
                  Tables & Fields
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {content.tables.map((table, i) => (
                  <div key={i} className="space-y-2">
                    <h4 className="font-semibold text-sm text-white">{table.name}</h4>
                    <UITable>
                      <TableHeader>
                        <TableRow className="border-slate-700">
                          <TableHead className="text-xs text-slate-400">Field</TableHead>
                          <TableHead className="text-xs text-slate-400">Type</TableHead>
                          <TableHead className="text-xs text-slate-400">Constraints</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {table.fields.map((field, j) => (
                          <TableRow key={j} className="border-slate-700">
                            <TableCell className="text-xs font-mono text-slate-300">{field.name}</TableCell>
                            <TableCell className="text-xs font-mono text-slate-400">{field.type}</TableCell>
                            <TableCell className="text-xs text-slate-400">{field.constraints || '-'}</TableCell>
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
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <Link2 className="w-4 h-4 text-orange-500" />
                  Table Relationships
                </CardTitle>
              </CardHeader>
              <CardContent>
                <UITable>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-xs text-slate-400">From</TableHead>
                      <TableHead className="text-xs text-slate-400">To</TableHead>
                      <TableHead className="text-xs text-slate-400">Type</TableHead>
                      <TableHead className="text-xs text-slate-400">Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {content.relationships.map((rel, i) => (
                      <TableRow key={i} className="border-slate-700">
                        <TableCell className="text-xs font-mono text-slate-300">{rel.from}</TableCell>
                        <TableCell className="text-xs font-mono text-slate-300">{rel.to}</TableCell>
                        <TableCell className="text-xs">
                          <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px]">
                            {rel.type}
                          </span>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">{rel.description || '-'}</TableCell>
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
  );
}
