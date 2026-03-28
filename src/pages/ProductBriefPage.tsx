import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BusinessCard } from '@/components/ui/business-card';
import { useArtifact } from '@/hooks/useArtifact';
import { Loader2, FileText, Target, Lightbulb, CheckCircle2, Users, Sparkles, Calendar, TrendingUp, Package, AlertTriangle } from 'lucide-react';
import { ArtifactBreadcrumb } from '@/components/dashboard/ArtifactBreadcrumb';
import { CopilotPanel } from '@/components/artifacts/ArtifactCopilot';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProjectContext } from '@/contexts/ProjectContext';

interface V1Feature {
  feature: string;
  description: string;
}

interface ProductBriefContent {
  elevator_pitch?: string;
  problem_statement?: string;
  target_users?: string;
  core_features?: string[];
  differentiators?: string;
  title?: string;
  summary?: string;
  problem?: string;
  solution?: string;
  targetAudience?: string[] | string;
  keyFeatures?: string[];
  successMetrics?: string[];
  success_metrics?: string[];
  constraints?: string[];
  timeline?: string;
  mvpScope?: string[];
  // New format fields
  v1_features?: V1Feature[];
  out_of_scope?: string[];
  product_tone?: string;
  core_value_proposition?: string;
}

export default function ProductBriefPage() {
  const { data: artifact, loading, error, refetch: refetchArtifact } = useArtifact('product_brief');
  const { selectedAppId } = useProjectContext();

  const { data: completionData } = useQuery({
    queryKey: ['app-completion-pb', selectedAppId],
    queryFn: async () => {
      if (!selectedAppId) return null;
      const { data } = await supabase
        .from('app_ideas')
        .select('pb_completion')
        .eq('id', selectedAppId)
        .maybeSingle();
      return data;
    },
    enabled: !!selectedAppId,
    refetchInterval: 10000,
  });

  const pbCompletion = (completionData as any)?.pb_completion ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const content = artifact?.content as ProductBriefContent | null;
  const coreValueProp = content?.core_value_proposition || content?.elevator_pitch || content?.summary;
  const problemStatement = content?.problem_statement || content?.problem;
  const targetUsers = content?.target_users || content?.targetAudience;
  const v1Features = content?.v1_features || [];
  const coreFeatures = content?.core_features || content?.keyFeatures || [];
  const differentiators = content?.differentiators || content?.solution;
  const productTone = content?.product_tone;
  const title = content?.title;
  const successMetrics = content?.success_metrics || content?.successMetrics || [];
  const outOfScope = content?.out_of_scope || content?.constraints || [];
  const mvpScope = content?.mvpScope || [];
  const timeline = content?.timeline;

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <div className="px-6 pt-4 pb-2 shrink-0 border-b border-slate-800/50">
        <ArtifactBreadcrumb currentPage="Product Brief" artifactType="product_brief" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <CopilotPanel context="product_brief" heading="Product Strategist" onArtifactRefresh={refetchArtifact} />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Product Brief</h1>
                <p className="text-secondary-foreground mt-1">Your comprehensive product requirements document</p>
              </div>
              {pbCompletion > 0 && (
                <div className="w-40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Completion</span>
                    <span className="text-xs font-semibold text-blue-400">{pbCompletion}%</span>
                  </div>
                  <Progress value={pbCompletion} className="h-1.5 bg-slate-700/50" />
                </div>
              )}
            </div>

            {error && (
              <Card className="border-destructive/50 bg-destructive/10">
                <CardContent className="p-4">
                  <p className="text-destructive text-base">Failed to load product brief</p>
                </CardContent>
              </Card>
            )}

            {!artifact ? (
              <Card className="bg-card border-slate-700/50">
                <CardContent className="p-8 text-center">
                  <FileText className="w-12 h-12 mx-auto text-secondary-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-foreground">No Product Brief Yet</h3>
                  <p className="text-secondary-foreground text-base">
                    Generate a product brief using the AI Architect on the Dashboard.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <motion.div 
                className="grid md:grid-cols-2 gap-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {coreValueProp && (
                  <BusinessCard title={title || 'Core Value Proposition'} icon={Sparkles} iconColor="text-primary" colSpan={2}>
                    <p>{coreValueProp}</p>
                  </BusinessCard>
                )}
                {problemStatement && (
                  <BusinessCard title="Problem Statement" icon={Target} iconColor="text-red-500">
                    <p>{problemStatement}</p>
                  </BusinessCard>
                )}
                {productTone && (
                  <BusinessCard title="Product Tone" icon={Lightbulb} iconColor="text-yellow-500">
                    <p>{productTone}</p>
                  </BusinessCard>
                )}
                {differentiators && (
                  <BusinessCard title="Differentiators" icon={Lightbulb} iconColor="text-yellow-500">
                    <p>{differentiators}</p>
                  </BusinessCard>
                )}
                {targetUsers && (
                  <BusinessCard title="Target Users" icon={Users} iconColor="text-purple-500" colSpan={2}>
                    {Array.isArray(targetUsers) ? (
                      <div className="flex flex-wrap gap-2">
                        {targetUsers.map((audience, i) => (
                          <Badge key={i} variant="secondary" className="text-sm bg-white/5 border border-white/10 text-secondary-foreground">{audience}</Badge>
                        ))}
                      </div>
                    ) : (
                      <p>{targetUsers}</p>
                    )}
                  </BusinessCard>
                )}
                {v1Features.length > 0 && (
                  <BusinessCard title="V1 Features" icon={CheckCircle2} iconColor="text-primary" colSpan={2}>
                    <ul className="grid md:grid-cols-2 gap-3">
                      {v1Features.map((f, i) => (
                        <li key={i} className="space-y-1">
                          <p className="font-medium flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{f.feature}</p>
                          <p className="text-sm text-muted-foreground ml-5">{f.description}</p>
                        </li>
                      ))}
                    </ul>
                  </BusinessCard>
                )}
                {coreFeatures.length > 0 && (
                  <BusinessCard title="Core Features" icon={CheckCircle2} iconColor="text-primary" colSpan={2}>
                    <ul className="grid md:grid-cols-2 gap-2">
                      {coreFeatures.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span>{feature}</li>
                      ))}
                    </ul>
                  </BusinessCard>
                )}
                {mvpScope.length > 0 && (
                  <BusinessCard title="MVP Scope" icon={Package} iconColor="text-green-500" colSpan={2}>
                    <ul className="space-y-1.5">
                      {mvpScope.map((item, i) => (
                        <li key={i} className="flex items-start gap-2"><span className="text-green-500 mt-0.5">✓</span>{item}</li>
                      ))}
                    </ul>
                  </BusinessCard>
                )}
                {outOfScope.length > 0 && (
                  <BusinessCard title="Out of Scope" icon={AlertTriangle} iconColor="text-orange-500" colSpan={2}>
                    <ul className="space-y-1.5">
                      {outOfScope.map((item, i) => (
                        <li key={i} className="flex items-start gap-2"><span className="text-orange-500 mt-0.5">✗</span>{item}</li>
                      ))}
                    </ul>
                  </BusinessCard>
                )}
                {successMetrics.length > 0 && (
                  <BusinessCard title="Success Metrics" icon={TrendingUp} iconColor="text-blue-500" colSpan={2}>
                    <div className="flex flex-wrap gap-2">
                      {successMetrics.map((metric, i) => (
                        <Badge key={i} variant="outline" className="text-sm border-white/10 text-secondary-foreground">{metric}</Badge>
                      ))}
                    </div>
                  </BusinessCard>
                )}
                {timeline && (
                  <BusinessCard title="Timeline" icon={Calendar} iconColor="text-orange-500" colSpan={2}>
                    <p>{timeline}</p>
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