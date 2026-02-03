import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessCard } from '@/components/ui/business-card';
import { useAppIdea } from '@/hooks/useAppIdea';
import { useBusinessModel } from '@/hooks/useBusinessModel';
import { useArtifact } from '@/hooks/useArtifact';
import { toast } from 'sonner';
import { Target, Users, DollarSign, Rocket, Building, Loader2, Megaphone } from 'lucide-react';
import { ArtifactBackButton } from '@/components/dashboard/ArtifactBackButton';
import { ArtifactCopilot } from '@/components/artifacts/ArtifactCopilot';
import { motion } from 'framer-motion';

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
  const { data: artifact, loading: artifactLoading, refetch: refetchArtifact } = useArtifact('business_model');
  
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
    <div className="flex h-full bg-[#0B0E14] min-h-screen">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6 p-6">
          <ArtifactBackButton />
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
            <motion.div 
              className="space-y-5"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-lg font-semibold text-white">Business Model Canvas</h2>
              
              <div className="grid md:grid-cols-3 gap-4">
                {valueProposition && (
                  <BusinessCard 
                    title="Value Proposition" 
                    icon={Target} 
                    iconColor="text-blue-500"
                    colSpan={2}
                  >
                    <p>{valueProposition}</p>
                  </BusinessCard>
                )}

                {customerSegments.length > 0 && (
                  <BusinessCard 
                    title="Customer Segments" 
                    icon={Users} 
                    iconColor="text-purple-500"
                  >
                    <ul className="space-y-1.5">
                      {customerSegments.map((segment, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">•</span>
                          {segment}
                        </li>
                      ))}
                    </ul>
                  </BusinessCard>
                )}

                {/* Revenue Streams - New format with source/price */}
                {revenueStreams.length > 0 && (
                  <BusinessCard 
                    title="Revenue Streams" 
                    icon={DollarSign} 
                    iconColor="text-green-500"
                    colSpan={2}
                  >
                    <ul className="space-y-2">
                      {revenueStreams.map((stream, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          <div>
                            <span className="font-medium text-white">{stream.source}</span>
                            {stream.price && (
                              <span className="ml-2">— {stream.price}</span>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </BusinessCard>
                )}

                {/* Legacy Revenue Streams - string array */}
                {legacyRevenueStreams.length > 0 && revenueStreams.length === 0 && (
                  <BusinessCard 
                    title="Revenue Streams" 
                    icon={DollarSign} 
                    iconColor="text-green-500"
                  >
                    <ul className="space-y-1.5">
                      {legacyRevenueStreams.map((stream, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-green-500 mt-0.5">•</span>
                          {stream}
                        </li>
                      ))}
                    </ul>
                  </BusinessCard>
                )}

                {/* Marketing Channels */}
                {marketingChannels.length > 0 && (
                  <BusinessCard 
                    title="Marketing Channels" 
                    icon={Megaphone} 
                    iconColor="text-orange-500"
                  >
                    <ul className="space-y-1.5">
                      {marketingChannels.map((channel, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-orange-500 mt-0.5">•</span>
                          {channel}
                        </li>
                      ))}
                    </ul>
                  </BusinessCard>
                )}

                {monetization && (
                  <BusinessCard 
                    title="Monetization Strategy" 
                    icon={DollarSign} 
                    iconColor="text-green-500"
                  >
                    <p>{monetization}</p>
                  </BusinessCard>
                )}

                {goToMarket && (
                  <BusinessCard 
                    title="Go-to-Market Approach" 
                    icon={Rocket} 
                    iconColor="text-orange-500"
                    colSpan={2}
                  >
                    <p>{goToMarket}</p>
                  </BusinessCard>
                )}

                {keyResources.length > 0 && (
                  <BusinessCard 
                    title="Key Resources" 
                    icon={Building} 
                    iconColor="text-blue-500"
                  >
                    <ul className="space-y-1.5">
                      {keyResources.map((resource, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">•</span>
                          {resource}
                        </li>
                      ))}
                    </ul>
                  </BusinessCard>
                )}

                {keyPartners.length > 0 && (
                  <BusinessCard 
                    title="Key Partners" 
                    icon={Users} 
                    iconColor="text-purple-500"
                  >
                    <ul className="space-y-1.5">
                      {keyPartners.map((partner, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-purple-500 mt-0.5">•</span>
                          {partner}
                        </li>
                      ))}
                    </ul>
                  </BusinessCard>
                )}

                {costStructure.length > 0 && (
                  <BusinessCard title="Cost Structure">
                    <ul className="space-y-1.5">
                      {costStructure.map((cost, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="text-muted-foreground mt-0.5">•</span>
                          {cost}
                        </li>
                      ))}
                    </ul>
                  </BusinessCard>
                )}
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Copilot Sidebar */}
      <ArtifactCopilot context="business_model" heading="Business Strategist" onArtifactRefresh={refetchArtifact} />
    </div>
  );
}
