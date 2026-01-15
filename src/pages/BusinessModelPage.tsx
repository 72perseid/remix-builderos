import { useState, useEffect } from 'react';
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
  const {
    appIdea
  } = useAppIdea();
  const {
    businessModel,
    saveBusinessModel,
    updateGeneratedContent
  } = useBusinessModel();
  const {
    data: artifact,
    loading: artifactLoading
  } = useArtifact('business_model');
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
    return <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Business Model</h1>
        <p className="text-slate-400 mt-1">Generate a comprehensive business model for your app</p>
      </div>

      {/* Input Form */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">Business Context</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-700">
            <Label className="text-xs text-slate-400">App Idea (from saved)</Label>
            <p className="text-sm mt-1 text-slate-300">{appIdea?.appDescription || 'No app idea saved yet'}</p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetMarket" className="text-slate-300">Target Market</Label>
            <Textarea id="targetMarket" value={targetMarket} onChange={e => setTargetMarket(e.target.value)} placeholder="Describe your target market, demographics, and market size..." rows={3} className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500" />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="competitiveAdvantage" className="text-slate-300">Competitive Advantage</Label>
            <Textarea id="competitiveAdvantage" value={competitiveAdvantage} onChange={e => setCompetitiveAdvantage(e.target.value)} placeholder="What makes your solution unique compared to existing alternatives..." rows={3} className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500" />
          </div>
          
          <Button onClick={handleGenerate} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700">
            <Sparkles className="w-4 h-4 mr-2" />
            {isGenerating ? 'Generating...' : 'Generate Business Model'}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Business Model Canvas */}
      {content && <div className="space-y-4 animate-fade-in">
          <h2 className="text-lg font-semibold text-secondary">Business Model Canvas</h2>
          
          <div className="grid md:grid-cols-3 gap-4">
            {content.valueProposition && <Card className="bg-slate-800/50 border-slate-700 md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Target className="w-4 h-4 text-blue-500" />
                    Value Proposition
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400">
                    {content.valueProposition}
                  </p>
                </CardContent>
              </Card>}

            {content.customerSegments && content.customerSegments.length > 0 && <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Users className="w-4 h-4 text-purple-500" />
                    Customer Segments
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {content.customerSegments.map((segment, i) => <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        {segment}
                      </li>)}
                  </ul>
                </CardContent>
              </Card>}

            {content.monetizationStrategy && <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    Monetization Strategy
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400">
                    {content.monetizationStrategy}
                  </p>
                </CardContent>
              </Card>}

            {content.goToMarketApproach && <Card className="bg-slate-800/50 border-slate-700 md:col-span-2">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Rocket className="w-4 h-4 text-orange-500" />
                    Go-to-Market Approach
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400">
                    {content.goToMarketApproach}
                  </p>
                </CardContent>
              </Card>}

            {content.keyResources && content.keyResources.length > 0 && <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Building className="w-4 h-4 text-blue-500" />
                    Key Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {content.keyResources.map((resource, i) => <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        {resource}
                      </li>)}
                  </ul>
                </CardContent>
              </Card>}

            {content.keyPartners && content.keyPartners.length > 0 && <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Handshake className="w-4 h-4 text-purple-500" />
                    Key Partners
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {content.keyPartners.map((partner, i) => <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-purple-500 mt-1">•</span>
                        {partner}
                      </li>)}
                  </ul>
                </CardContent>
              </Card>}

            {content.revenueStreams && content.revenueStreams.length > 0 && <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <DollarSign className="w-4 h-4 text-green-500" />
                    Revenue Streams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {content.revenueStreams.map((stream, i) => <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-green-500 mt-1">•</span>
                        {stream}
                      </li>)}
                  </ul>
                </CardContent>
              </Card>}

            {content.costStructure && content.costStructure.length > 0 && <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-white">Cost Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {content.costStructure.map((cost, i) => <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                        <span className="text-slate-500 mt-1">•</span>
                        {cost}
                      </li>)}
                  </ul>
                </CardContent>
              </Card>}
          </div>
        </div>}
    </div>;
}