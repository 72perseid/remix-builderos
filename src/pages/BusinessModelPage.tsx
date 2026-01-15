import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAppIdea } from '@/hooks/useAppIdea';
import { useBusinessModel } from '@/hooks/useBusinessModel';
import { useArtifact } from '@/hooks/useArtifact';
import { toast } from 'sonner';
import { Sparkles, Target, Users, DollarSign, Rocket, Building, Loader2, Megaphone } from 'lucide-react';

interface RevenueStream {
  source: string;
  price: string;
}

interface BusinessModelContent {
  value_proposition?: string;
  customer_segments?: string[];
  revenue_streams?: RevenueStream[];
  cost_structure?: string[];
  marketing_channels?: string[];
  // Legacy camelCase support
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
  const { businessModel } = useBusinessModel();
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
    
    setTimeout(() => {
      setIsGenerating(false);
      toast.info('AI generation not yet configured');
    }, 1000);
  };

  // Use artifact content if available, otherwise fall back to local hook
  const content: BusinessModelContent | null = artifact?.content as BusinessModelContent || businessModel?.generatedModel;

  // Normalize data (handle both snake_case and camelCase)
  const valueProposition = content?.value_proposition || content?.valueProposition;
  const customerSegments = content?.customer_segments || content?.customerSegments || [];
  const revenueStreams = content?.revenue_streams || [];
  const legacyRevenueStreams = content?.revenueStreams || [];
  const costStructure = content?.cost_structure || content?.costStructure || [];
  const marketingChannels = content?.marketing_channels || [];
  const goToMarket = content?.goToMarketApproach;
  const monetization = content?.monetizationStrategy;
  const keyResources = content?.keyResources || [];
  const keyPartners = content?.keyPartners || [];

  if (artifactLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Business Model</h1>
        <p className="text-muted-foreground mt-1">Generate a comprehensive business model for your app</p>
      </div>


      {/* Empty State */}
      {!content && (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-8 text-center">
            <Target className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No Business Model Yet</h3>
            <p className="text-muted-foreground text-sm">
              Generate a business model using the AI Architect on the Dashboard.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Generated Business Model Canvas */}
      {content && (
        <div className="space-y-4 animate-fade-in">
          <h2 className="text-lg font-semibold text-white">Business Model Canvas</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {valueProposition && (
              <Card className="bg-[#161e2a]/80 backdrop-blur-sm border-white/10 md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Target className="w-4 h-4 text-blue-500" />
                    Value Proposition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {valueProposition}
                  </p>
                </CardContent>
              </Card>
            )}

            {customerSegments.length > 0 && (
              <Card className="bg-[#161e2a]/80 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Users className="w-4 h-4 text-purple-500" />
                    Customer Segments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {customerSegments.map((segment, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        {segment}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Revenue Streams - New format with source/price */}
            {revenueStreams.length > 0 && (
              <Card className="bg-[#161e2a]/80 backdrop-blur-sm border-white/10 md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    Revenue Streams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {revenueStreams.map((stream, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        <div>
                          <span className="font-medium text-foreground/90">{stream.source}</span>
                          {stream.price && (
                            <span className="text-muted-foreground ml-2">— {stream.price}</span>
                          )}
                        </div>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Legacy Revenue Streams - string array */}
            {legacyRevenueStreams.length > 0 && revenueStreams.length === 0 && (
              <Card className="bg-[#161e2a]/80 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    Revenue Streams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {legacyRevenueStreams.map((stream, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {stream}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Marketing Channels */}
            {marketingChannels.length > 0 && (
              <Card className="bg-[#161e2a]/80 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Megaphone className="w-4 h-4 text-orange-500" />
                    Marketing Channels
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {marketingChannels.map((channel, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-orange-500 mt-1">•</span>
                        {channel}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {monetization && (
              <Card className="bg-[#161e2a]/80 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    Monetization Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {monetization}
                  </p>
                </CardContent>
              </Card>
            )}

            {goToMarket && (
              <Card className="bg-[#161e2a]/80 backdrop-blur-sm border-white/10 md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Rocket className="w-4 h-4 text-orange-500" />
                    Go-to-Market Approach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {goToMarket}
                  </p>
                </CardContent>
              </Card>
            )}

            {keyResources.length > 0 && (
              <Card className="bg-[#161e2a]/80 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Building className="w-4 h-4 text-blue-500" />
                    Key Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {keyResources.map((resource, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {resource}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {keyPartners.length > 0 && (
              <Card className="bg-[#161e2a]/80 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Users className="w-4 h-4 text-purple-500" />
                    Key Partners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {keyPartners.map((partner, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        {partner}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {costStructure.length > 0 && (
              <Card className="bg-[#161e2a]/80 backdrop-blur-sm border-white/10">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white">Cost Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {costStructure.map((cost, i) => (
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
  );
}
