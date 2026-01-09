import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useAppIdea } from '@/hooks/useAppIdea';
import { useTasks } from '@/hooks/useTasks';
import { useArtifact } from '@/hooks/useArtifact';
import { GeneratedFeature, TaskCategory, TaskPriority } from '@/types';
import { toast } from 'sonner';
import { Sparkles, Download, Zap, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RoadmapItem {
  id?: string;
  title: string;
  description?: string;
  category?: TaskCategory;
  priority?: TaskPriority;
  estimatedEffort?: string;
  status?: string;
}

interface RoadmapContent {
  features?: RoadmapItem[];
  columns?: {
    name: string;
    items: RoadmapItem[];
  }[];
  mvp?: RoadmapItem[];
  v1?: RoadmapItem[];
  stretchGoals?: RoadmapItem[];
}

const categoryColors: Record<TaskCategory, string> = {
  MVP: 'bg-category-mvp text-white',
  V1: 'bg-category-v1 text-white',
  'Stretch Goals': 'bg-category-stretch text-gray-900',
};

const priorityColors: Record<TaskPriority, string> = {
  high: 'bg-priority-high/10 text-priority-high border-priority-high/30',
  medium: 'bg-priority-medium/10 text-priority-medium border-priority-medium/30',
  low: 'bg-priority-low/10 text-priority-low border-priority-low/30',
};

export default function AIKanbanAssistantPage() {
  const { appIdea } = useAppIdea();
  const { importTasks } = useTasks();
  const { data: artifact, loading: artifactLoading } = useArtifact('kanban');
  const [isGenerating, setIsGenerating] = useState(false);

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

  // Parse artifact content
  const content = artifact?.content as RoadmapContent | null;
  
  // Normalize features from different possible structures
  const getAllFeatures = (): RoadmapItem[] => {
    if (!content) return [];
    
    // If features array exists
    if (content.features) return content.features;
    
    // If columns structure exists
    if (content.columns) {
      return content.columns.flatMap(col => col.items);
    }
    
    // If MVP/V1/stretchGoals structure exists
    const all: RoadmapItem[] = [];
    if (content.mvp) all.push(...content.mvp.map(f => ({ ...f, category: 'MVP' as TaskCategory })));
    if (content.v1) all.push(...content.v1.map(f => ({ ...f, category: 'V1' as TaskCategory })));
    if (content.stretchGoals) all.push(...content.stretchGoals.map(f => ({ ...f, category: 'Stretch Goals' as TaskCategory })));
    
    return all;
  };

  const features = getAllFeatures();

  const handleImportToKanban = () => {
    if (features.length === 0) {
      toast.error('No features to import');
      return;
    }

    const tasksToImport = features.map((feature, idx) => ({
      title: feature.title,
      description: feature.description || '',
      status: 'backlog' as const,
      color: 'lavender' as const,
      category: feature.category || 'MVP',
      priority: feature.priority || 'medium',
      estimatedEffort: feature.estimatedEffort || '',
    }));

    importTasks(tasksToImport);
    toast.success(`Imported ${features.length} features to Kanban board!`);
  };

  const groupedFeatures = {
    MVP: features.filter(f => f.category === 'MVP'),
    V1: features.filter(f => f.category === 'V1'),
    'Stretch Goals': features.filter(f => f.category === 'Stretch Goals'),
  };

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
          <h1 className="text-2xl font-bold gradient-text">AI Kanban Assistant</h1>
          <p className="text-muted-foreground mt-1">Generate a feature roadmap and import directly to your Kanban board</p>
        </div>

        {/* Input Form */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Generate Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Label className="text-xs text-muted-foreground">App Idea</Label>
                <p className="text-sm mt-1">{appIdea?.appName || 'No app name saved'}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                <Label className="text-xs text-muted-foreground">Business Context</Label>
                <p className="text-sm mt-1 line-clamp-2">{appIdea?.appDescription || 'No description saved'}</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button onClick={handleGenerate} disabled={isGenerating}>
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate Roadmap'}
              </Button>
              
              {features.length > 0 && (
                <Button onClick={handleImportToKanban} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Import to Kanban Board
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Generated Features */}
        {features.length > 0 && (
          <div className="space-y-6 animate-fade-in">
            {(['MVP', 'V1', 'Stretch Goals'] as TaskCategory[]).map(category => (
              groupedFeatures[category].length > 0 && (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'px-3 py-1 rounded-full text-sm font-medium',
                      categoryColors[category]
                    )}>
                      {category}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {groupedFeatures[category].length} features
                    </span>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {groupedFeatures[category].map((feature, idx) => (
                      <Card key={feature.id || idx} className="glass hover:shadow-lg transition-shadow">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm flex items-center gap-2">
                              <Zap className="w-4 h-4 text-primary" />
                              {feature.title}
                            </h4>
                            {feature.priority && (
                              <span className={cn(
                                'text-[10px] px-2 py-0.5 rounded border capitalize',
                                priorityColors[feature.priority]
                              )}>
                                {feature.priority}
                              </span>
                            )}
                          </div>
                          
                          {feature.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {feature.description}
                            </p>
                          )}
                          
                          {feature.estimatedEffort && (
                            <div className="text-[10px] text-muted-foreground">
                              Est. effort: {feature.estimatedEffort}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )
            ))}
          </div>
        )}

        {/* Empty State */}
        {!artifact && features.length === 0 && (
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <Zap className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Roadmap Yet</h3>
              <p className="text-muted-foreground text-sm">
                Generate a feature roadmap using the AI assistant to see it here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}
