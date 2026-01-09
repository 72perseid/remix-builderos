import { useState, useEffect } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAppIdea } from '@/hooks/useAppIdea';
import { useBusinessModel } from '@/hooks/useBusinessModel';
import { useArtifact } from '@/hooks/useArtifact';
import { toast } from 'sonner';
import { Sparkles, Target, Users, DollarSign, Rocket, Building, Handshake, Loader2 } from 'lucide-react';

interface BusinessModelContent {
  valueProposition?: string;
  customerSegments?: string[];
  monetizationStrategy?: string;
  goToMarketApproach?: string;
  keyResources?: string[];
  keyPartners?: string[];
  revenueStreams?: string[];
  costStructure?: string[];
}

export default function BusinessModelPage() {
  const { appIdea } = useAppIdea();
  const { businessModel, saveBusinessModel, updateGeneratedContent } = useBusinessModel();
  const { data: artifact, loading: artifactLoading } = useArtifact('business_model');
  
  const [targetMarket, setTargetMarket] = useState(businessModel?.targetMarket || '');
  const [competitiveAdvantage, setCompetitiveAdvantage] = useState(businessModel?.competitiveAdvantage || '');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (businessModel) {
      setTargetMarket(businessModel.targetMarket || '');
      setCompetitiveAdvantage(businessModel.competitiveAdvantage || '');
    }
  }, [businessModel]);

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
  const content: BusinessModelContent | null = artifact?.content as BusinessModelContent || businessModel?.generatedModel;

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
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Business Model</h1>
          <p className="text-muted-foreground mt-1">Generate a comprehensive business model for your app</p>
        </div>

        {/* Input Form */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">Business Context</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
              <Label className="text-xs text-muted-foreground">App Idea (from saved)</Label>
              <p className="text-sm mt-1">{appIdea?.appDescription || 'No app idea saved yet'}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="targetMarket">Target Market</Label>
              <Textarea
                id="targetMarket"
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                placeholder="Describe your target market, demographics, and market size..."
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="competitiveAdvantage">Competitive Advantage</Label>
              <Textarea
                id="competitiveAdvantage"
                value={competitiveAdvantage}
                onChange={(e) => setCompetitiveAdvantage(e.target.value)}
                placeholder="What makes your solution unique compared to existing alternatives..."
                rows={3}
              />
            </div>
            
            <Button onClick={handleGenerate} disabled={isGenerating}>
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Business Model'}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Business Model Canvas */}
        {content && (
          <div className="space-y-4 animate-fade-in">
            <h2 className="text-lg font-semibold">Business Model Canvas</h2>
            
            <div className="grid md:grid-cols-3 gap-4">
              {content.valueProposition && (
                <Card className="glass md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="w-4 h-4 text-primary" />
                      Value Proposition
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {content.valueProposition}
                    </p>
                  </CardContent>
                </Card>
              )}

              {content.customerSegments && content.customerSegments.length > 0 && (
                <Card className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Users className="w-4 h-4 text-accent" />
                      Customer Segments
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {content.customerSegments.map((segment, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          {segment}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {content.monetizationStrategy && (
                <Card className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-priority-low" />
                      Monetization Strategy
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {content.monetizationStrategy}
                    </p>
                  </CardContent>
                </Card>
              )}

              {content.goToMarketApproach && (
                <Card className="glass md:col-span-2">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Rocket className="w-4 h-4 text-category-stretch" />
                      Go-to-Market Approach
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {content.goToMarketApproach}
                    </p>
                  </CardContent>
                </Card>
              )}

              {content.keyResources && content.keyResources.length > 0 && (
                <Card className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Building className="w-4 h-4 text-primary" />
                      Key Resources
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {content.keyResources.map((resource, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary mt-1">•</span>
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {content.keyPartners && content.keyPartners.length > 0 && (
                <Card className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Handshake className="w-4 h-4 text-accent" />
                      Key Partners
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {content.keyPartners.map((partner, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-accent mt-1">•</span>
                          {partner}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {content.revenueStreams && content.revenueStreams.length > 0 && (
                <Card className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-priority-low" />
                      Revenue Streams
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {content.revenueStreams.map((stream, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-priority-low mt-1">•</span>
                          {stream}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {content.costStructure && content.costStructure.length > 0 && (
                <Card className="glass">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Cost Structure</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {content.costStructure.map((cost, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-muted-foreground mt-1">•</span>
                          {cost}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
