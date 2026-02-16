import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessCard } from '@/components/ui/business-card';
import { useAppIdea } from '@/hooks/useAppIdea';
import { useBusinessModel } from '@/hooks/useBusinessModel';
import { useArtifact } from '@/hooks/useArtifact';
import { toast } from 'sonner';
import { Target, Users, DollarSign, Rocket, Building, Loader2, Megaphone } from 'lucide-react';
import { ArtifactBreadcrumb } from '@/components/dashboard/ArtifactBreadcrumb';
import { CopilotPanel } from '@/components/artifacts/ArtifactCopilot';
import { motion } from 'framer-motion';

interface BusinessModel {
  targetMarket: string;
  competitiveAdvantage: string;
  generatedModel?: any;
}

interface AppIdea {
  appDescription: string;
}

interface Artifact {
  content: any;
}

// Helper function to parse JSON content from artifact
function parseContent(artifact: Artifact | undefined): any {
  if (!artifact || !artifact.content) {
    return null;
  }
  try {
    if (typeof artifact.content === 'string') {
      return JSON.parse(artifact.content);
    } else {
      return artifact.content;
    }
  } catch (e) {
    console.error("Failed to parse artifact content", e);
    return null;
  }
}

interface RevenueStream {
  source: string;
  price: string;
}

// Flexible interface to handle various data formats from n8n
interface BusinessModelContent {
  // New format from n8n (actual data structure)
  name?: string;
  revenue?: {
    source?: string;
    annualRevenue?: number;
  };
  expenses?: {
    fixedCosts?: number;
    variableCosts?: number;
  };
  customers?: {
    segment?: string;
    number?: number;
  };
  // Standard format
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

// Helper to extract JSON from markdown code blocks or raw text
function parseArtifactContent(rawContent: unknown): BusinessModelContent | null {
  if (!rawContent) return null;
  
  // If already an object, return as-is
  if (typeof rawContent === 'object' && rawContent !== null) {
    const obj = rawContent as Record<string, unknown>;
    // Handle nested businessModel key
    if (obj.businessModel && typeof obj.businessModel === 'object') {
      return obj.businessModel as BusinessModelContent;
    }
    return rawContent as BusinessModelContent;
  }
  
  // If string, try to extract JSON
  if (typeof rawContent === 'string') {
    try {
      // Try to find JSON in markdown code block
      const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
      if (jsonMatch && jsonMatch[1]) {
        const parsed = JSON.parse(jsonMatch[1]);
        // Handle nested businessModel key
        return parsed.businessModel || parsed;
      }
      
      // Try direct JSON parse (in case it's raw JSON)
      const directParse = JSON.parse(rawContent);
      return directParse.businessModel || directParse;
    } catch {
      console.warn('Failed to parse artifact content:', rawContent.substring(0, 100));
      return null;
    }
  }
  
  return null;
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
  const content: BusinessModelContent | null = parseArtifactContent(artifact?.content) || businessModel?.generatedModel;

  // Normalize data (handle multiple formats)
  const businessName = content?.name;
  const revenueInfo = content?.revenue;
  const expensesInfo = content?.expenses;
  const customersInfo = content?.customers;
  
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
    <div className="h-full min-h-screen flex flex-col bg-[#0B0E14]">
      <div className="px-6 pt-4 pb-2 shrink-0">
        <ArtifactBreadcrumb currentPage="Business Model" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <CopilotPanel context="business_model" heading="Business Strategist" onArtifactRefresh={refetchArtifact} />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-full space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white">Business Model</h1>
              <p className="text-secondary-foreground mt-1">Generate a comprehensive business model for your app</p>
            </div>

            {/* Empty State */}
            {!content && (
              <Card className="bg-card/50 border-border">
                <CardContent className="p-8 text-center">
                  <Target className="w-12 h-12 mx-auto text-secondary-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">No Business Model Yet</h3>
                  <p className="text-secondary-foreground text-sm">
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
                {valueProposition && (
                  <BusinessCard title="Value Proposition" icon={Target} iconColor="text-blue-500" colSpan={2}>
                    <p>{valueProposition}</p>
                  </BusinessCard>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {businessName && (
                    <BusinessCard title="Business Name" icon={Building} iconColor="text-blue-500">
                      <p>{businessName}</p>
                    </BusinessCard>
                  )}
                  {monetization && (
                    <BusinessCard title="Monetization Strategy" icon={DollarSign} iconColor="text-green-500">
                      <p>{monetization}</p>
                    </BusinessCard>
                  )}
                </div>

                {customerSegments.length > 0 && (
                  <BusinessCard title="Customer Segments" icon={Users} iconColor="text-purple-500">
                    <ul className="space-y-1.5">
                      {customerSegments.map((s, i) => <li key={i} className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">•</span>{s}</li>)}
                    </ul>
                  </BusinessCard>
                )}

                {customersInfo && (
                  <BusinessCard title="Customers" icon={Users} iconColor="text-purple-500">
                    <div className="space-y-1">
                      {customersInfo.segment && <p>{customersInfo.segment}</p>}
                      {customersInfo.number !== undefined && <p>Count: {customersInfo.number.toLocaleString()}</p>}
                    </div>
                  </BusinessCard>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {revenueInfo && (
                    <BusinessCard title="Revenue" icon={DollarSign} iconColor="text-green-500">
                      <div className="space-y-1">
                        {revenueInfo.source && <p>{revenueInfo.source}</p>}
                        {revenueInfo.annualRevenue && <p>Annual: ${revenueInfo.annualRevenue.toLocaleString()}</p>}
                      </div>
                    </BusinessCard>
                  )}
                  {expensesInfo && (
                    <BusinessCard title="Expenses" icon={DollarSign} iconColor="text-red-500">
                      <div className="space-y-1">
                        {expensesInfo.fixedCosts !== undefined && <p>Fixed: ${expensesInfo.fixedCosts.toLocaleString()}</p>}
                        {expensesInfo.variableCosts !== undefined && <p>Variable: ${expensesInfo.variableCosts.toLocaleString()}</p>}
                      </div>
                    </BusinessCard>
                  )}
                </div>

                {revenueStreams.length > 0 && (
                  <BusinessCard title="Revenue Streams" icon={DollarSign} iconColor="text-green-500">
                    <ul className="space-y-1.5">
                      {revenueStreams.map((s, i) => <li key={i} className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span>{s.source}{s.price && ` — ${s.price}`}</li>)}
                    </ul>
                  </BusinessCard>
                )}

                {legacyRevenueStreams.length > 0 && revenueStreams.length === 0 && (
                  <BusinessCard title="Revenue Streams" icon={DollarSign} iconColor="text-green-500">
                    <ul className="space-y-1.5">
                      {legacyRevenueStreams.map((s, i) => <li key={i} className="flex items-start gap-2"><span className="text-green-500 mt-0.5">•</span>{s}</li>)}
                    </ul>
                  </BusinessCard>
                )}

                {marketingChannels.length > 0 && (
                  <BusinessCard title="Marketing Channels" icon={Megaphone} iconColor="text-orange-500">
                    <ul className="space-y-1.5">
                      {marketingChannels.map((c, i) => <li key={i} className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">•</span>{c}</li>)}
                    </ul>
                  </BusinessCard>
                )}

                {goToMarket && (
                  <BusinessCard title="Go-to-Market Approach" icon={Rocket} iconColor="text-orange-500">
                    <p>{goToMarket}</p>
                  </BusinessCard>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {keyResources.length > 0 && (
                    <BusinessCard title="Key Resources" icon={Building} iconColor="text-blue-500">
                      <ul className="space-y-1.5">
                        {keyResources.map((r, i) => <li key={i} className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>{r}</li>)}
                      </ul>
                    </BusinessCard>
                  )}
                  {keyPartners.length > 0 && (
                    <BusinessCard title="Key Partners" icon={Users} iconColor="text-purple-500">
                      <ul className="space-y-1.5">
                        {keyPartners.map((p, i) => <li key={i} className="flex items-start gap-2"><span className="text-purple-500 mt-0.5">•</span>{p}</li>)}
                      </ul>
                    </BusinessCard>
                  )}
                </div>

                {costStructure.length > 0 && (
                  <BusinessCard title="Cost Structure" icon={DollarSign} iconColor="text-secondary-foreground">
                    <ul className="space-y-1.5">
                      {costStructure.map((c, i) => <li key={i} className="flex items-start gap-2"><span className="text-secondary-foreground mt-0.5">•</span>{c}</li>)}
                    </ul>
                  </BusinessCard>
                )}
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
