import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BusinessCard } from '@/components/ui/business-card';
import { useArtifact } from '@/hooks/useArtifact';
import { Loader2, FileText, Target, Lightbulb, CheckCircle2, Users, Sparkles, Calendar, TrendingUp, Package } from 'lucide-react';
import { ArtifactBackButton } from '@/components/dashboard/ArtifactBackButton';
import { ArtifactCopilot } from '@/components/artifacts/ArtifactCopilot';
import { motion } from 'framer-motion';

interface ProductBriefContent {
  // Snake_case from database
  elevator_pitch?: string;
  problem_statement?: string;
  target_users?: string;
  core_features?: string[];
  differentiators?: string;
  // Legacy camelCase support
  title?: string;
  summary?: string;
  problem?: string;
  solution?: string;
  targetAudience?: string[] | string;
  keyFeatures?: string[];
  successMetrics?: string[];
  constraints?: string[];
  timeline?: string;
  mvpScope?: string[];
}

export default function ProductBriefPage() {
  const { data: artifact, loading, error } = useArtifact('product_brief');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const content = artifact?.content as ProductBriefContent | null;

  // Normalize data (handle both snake_case and camelCase)
  const elevatorPitch = content?.elevator_pitch || content?.summary;
  const problemStatement = content?.problem_statement || content?.problem;
  const targetUsers = content?.target_users || content?.targetAudience;
  const coreFeatures = content?.core_features || content?.keyFeatures || [];
  const differentiators = content?.differentiators || content?.solution;
  const title = content?.title;
  const successMetrics = content?.successMetrics || [];
  const mvpScope = content?.mvpScope || [];
  const timeline = content?.timeline;

  return (
    <div className="flex h-full bg-[#0B0E14] min-h-screen">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto space-y-6 p-6">
          <ArtifactBackButton />
          <div>
            <h1 className="text-2xl font-bold text-white">Product Brief</h1>
            <p className="text-muted-foreground mt-1">
              Your comprehensive product requirements document
            </p>
          </div>

          {error && (
            <Card className="border-destructive/50 bg-destructive/10">
              <CardContent className="p-4">
                <p className="text-destructive text-base">Failed to load product brief</p>
              </CardContent>
            </Card>
          )}

          {!artifact ? (
            <Card className="bg-gradient-to-br from-[#1a2235] via-[#161e2a] to-[#0f1729] border-white/10">
              <CardContent className="p-8 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">No Product Brief Yet</h3>
                <p className="text-muted-foreground text-base">
                  Generate a product brief using the AI Architect on the Dashboard.
                </p>
              </CardContent>
            </Card>
          ) : (
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Elevator Pitch / Summary */}
              {elevatorPitch && (
                <BusinessCard 
                  title={title || 'Elevator Pitch'}
                  icon={Sparkles}
                  iconColor="text-primary"
                  colSpan={2}
                >
                  <p>{elevatorPitch}</p>
                </BusinessCard>
              )}

              {/* Problem Statement & Differentiators */}
              <div className="grid md:grid-cols-2 gap-4">
                {problemStatement && (
                  <BusinessCard 
                    title="Problem Statement"
                    icon={Target}
                    iconColor="text-red-500"
                  >
                    <p>{problemStatement}</p>
                  </BusinessCard>
                )}

                {differentiators && (
                  <BusinessCard 
                    title="Differentiators"
                    icon={Lightbulb}
                    iconColor="text-yellow-500"
                  >
                    <p>{differentiators}</p>
                  </BusinessCard>
                )}
              </div>

              {/* Target Users */}
              {targetUsers && (
                <BusinessCard 
                  title="Target Users"
                  icon={Users}
                  iconColor="text-purple-500"
                >
                  {Array.isArray(targetUsers) ? (
                    <div className="flex flex-wrap gap-2">
                      {targetUsers.map((audience, i) => (
                        <Badge key={i} variant="secondary" className="text-sm bg-white/5 border border-white/10 text-muted-foreground">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p>{targetUsers}</p>
                  )}
                </BusinessCard>
              )}

              {/* Core Features */}
              {coreFeatures.length > 0 && (
                <BusinessCard 
                  title="Core Features"
                  icon={CheckCircle2}
                  iconColor="text-primary"
                >
                  <ul className="grid md:grid-cols-2 gap-2">
                    {coreFeatures.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </BusinessCard>
              )}

              {/* MVP Scope */}
              {mvpScope.length > 0 && (
                <BusinessCard 
                  title="MVP Scope"
                  icon={Package}
                  iconColor="text-green-500"
                >
                  <ul className="space-y-1.5">
                    {mvpScope.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-green-500 mt-0.5">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </BusinessCard>
              )}

              {/* Success Metrics */}
              {successMetrics.length > 0 && (
                <BusinessCard 
                  title="Success Metrics"
                  icon={TrendingUp}
                  iconColor="text-blue-500"
                >
                  <div className="flex flex-wrap gap-2">
                    {successMetrics.map((metric, i) => (
                      <Badge key={i} variant="outline" className="text-sm border-white/10 text-muted-foreground">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </BusinessCard>
              )}

              {/* Timeline */}
              {timeline && (
                <BusinessCard 
                  title="Timeline"
                  icon={Calendar}
                  iconColor="text-orange-500"
                >
                  <p>{timeline}</p>
                </BusinessCard>
              )}
            </motion.div>
          )}
        </div>
      </div>

      {/* Copilot Sidebar */}
      <ArtifactCopilot context="product_brief" heading="Product Strategist" />
    </div>
  );
}
