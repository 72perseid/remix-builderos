import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessCard } from '@/components/ui/business-card';
import { useAppIdea } from '@/hooks/useAppIdea';
import { useBusinessModel } from '@/hooks/useBusinessModel';
import { useArtifact } from '@/hooks/useArtifact';
import { toast } from 'sonner';
import { Target, Users, DollarSign, Rocket, Building, Loader2, Megaphone } from 'lucide-react';
import { ArtifactBackButton } from '@/components/dashboard/ArtifactBackButton';
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
      <div className="p-4 shrink-0">
        <ArtifactBackButton />
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
                <h2 className="text-lg font-semibold text-white">Business Model Canvas</h2>
                
                <div className="divide-y divide-slate-700/50">
                  {businessName && (
                    <div className="flex items-start gap-3 py-4">
                      <Building className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white">Business Name</h3>
                        <p className="text-sm text-secondary-foreground mt-0.5">{businessName}</p>
                      </div>
                    </div>
                  )}
                  {revenueInfo && (
                    <div className="flex items-start gap-3 py-4">
                      <DollarSign className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white">Revenue</h3>
                        <div className="text-sm text-secondary-foreground mt-0.5 space-y-1">
                          {revenueInfo.source && <p>{revenueInfo.source}</p>}
                          {revenueInfo.annualRevenue && <p>Annual: ${revenueInfo.annualRevenue.toLocaleString()}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                  {expensesInfo && (
                    <div className="flex items-start gap-3 py-4">
                      <DollarSign className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white">Expenses</h3>
                        <div className="text-sm text-secondary-foreground mt-0.5 space-y-1">
                          {expensesInfo.fixedCosts !== undefined && <p>Fixed: ${expensesInfo.fixedCosts.toLocaleString()}</p>}
                          {expensesInfo.variableCosts !== undefined && <p>Variable: ${expensesInfo.variableCosts.toLocaleString()}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                  {customersInfo && (
                    <div className="flex items-start gap-3 py-4">
                      <Users className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white">Customers</h3>
                        <div className="text-sm text-secondary-foreground mt-0.5 space-y-1">
                          {customersInfo.segment && <p>{customersInfo.segment}</p>}
                          {customersInfo.number !== undefined && <p>Count: {customersInfo.number.toLocaleString()}</p>}
                        </div>
                      </div>
                    </div>
                  )}
                  {valueProposition && (
                    <div className="flex items-start gap-3 py-4">
                      <Target className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white">Value Proposition</h3>
                        <p className="text-sm text-secondary-foreground mt-0.5">{valueProposition}</p>
                      </div>
                    </div>
                  )}
                  {customerSegments.length > 0 && (
                    <div className="flex items-start gap-3 py-4">
                      <Users className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white">Customer Segments</h3>
                        <ul className="text-sm text-secondary-foreground mt-0.5 space-y-1">
                          {customerSegments.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                  {revenueStreams.length > 0 && (
                    <div className="flex items-start gap-3 py-4">
                      <DollarSign className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white">Revenue Streams</h3>
                        <ul className="text-sm text-secondary-foreground mt-0.5 space-y-1">
                          {revenueStreams.map((s, i) => <li key={i}>{s.source}{s.price && ` — ${s.price}`}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                  {legacyRevenueStreams.length > 0 && revenueStreams.length === 0 && (
                    <div className="flex items-start gap-3 py-4">
                      <DollarSign className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white">Revenue Streams</h3>
                        <ul className="text-sm text-secondary-foreground mt-0.5 space-y-1">
                          {legacyRevenueStreams.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                  {marketingChannels.length > 0 && (
                    <div className="flex items-start gap-3 py-4">
                      <Megaphone className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white">Marketing Channels</h3>
                        <ul className="text-sm text-secondary-foreground mt-0.5 space-y-1">
                          {marketingChannels.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                  {monetization && (
                    <div className="flex items-start gap-3 py-4">
                      <DollarSign className="w-5 h-5 text-green-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white">Monetization Strategy</h3>
                        <p className="text-sm text-secondary-foreground mt-0.5">{monetization}</p>
                      </div>
                    </div>
                  )}
                  {goToMarket && (
                    <div className="flex items-start gap-3 py-4">
                      <Rocket className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white">Go-to-Market Approach</h3>
                        <p className="text-sm text-secondary-foreground mt-0.5">{goToMarket}</p>
                      </div>
                    </div>
                  )}
                  {keyResources.length > 0 && (
                    <div className="flex items-start gap-3 py-4">
                      <Building className="w-5 h-5 text-blue-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white">Key Resources</h3>
                        <ul className="text-sm text-secondary-foreground mt-0.5 space-y-1">
                          {keyResources.map((r, i) => <li key={i}>{r}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                  {keyPartners.length > 0 && (
                    <div className="flex items-start gap-3 py-4">
                      <Users className="w-5 h-5 text-purple-500 mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white">Key Partners</h3>
                        <ul className="text-sm text-secondary-foreground mt-0.5 space-y-1">
                          {keyPartners.map((p, i) => <li key={i}>{p}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                  {costStructure.length > 0 && (
                    <div className="flex items-start gap-3 py-4">
                      <DollarSign className="w-5 h-5 text-secondary-foreground mt-0.5 shrink-0" />
                      <div>
                        <h3 className="text-base font-semibold text-white">Cost Structure</h3>
                        <ul className="text-sm text-secondary-foreground mt-0.5 space-y-1">
                          {costStructure.map((c, i) => <li key={i}>{c}</li>)}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
