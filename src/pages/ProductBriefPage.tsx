import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useArtifact } from '@/hooks/useArtifact';
import { Loader2, FileText, Target, Lightbulb, CheckCircle2, Users, Sparkles } from 'lucide-react';

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
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Product Brief</h1>
        <p className="text-muted-foreground mt-1">
          Your comprehensive product requirements document
        </p>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">Failed to load product brief</p>
          </CardContent>
        </Card>
      )}

      {!artifact ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No Product Brief Yet</h3>
            <p className="text-muted-foreground text-sm">
              Generate a product brief using the AI Architect on the Dashboard.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Elevator Pitch / Summary */}
          {elevatorPitch && (
            <Card className="bg-[#161e2a] border-border">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5 text-primary" />
                  {title || 'Elevator Pitch'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-[#65686f]">{elevatorPitch}</p>
              </CardContent>
            </Card>
          )}

          {/* Problem Statement & Differentiators */}
          <div className="grid md:grid-cols-2 gap-4">
            {problemStatement && (
              <Card className="bg-[#161e2a] border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Target className="w-4 h-4 text-red-500" />
                    Problem Statement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#65686f]">{problemStatement}</p>
                </CardContent>
              </Card>
            )}

            {differentiators && (
              <Card className="bg-[#161e2a] border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    Differentiators
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-[#65686f]">{differentiators}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Target Users */}
          {targetUsers && (
            <Card className="bg-[#161e2a] border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <Users className="w-4 h-4 text-purple-500" />
                  Target Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(targetUsers) ? (
                  <div className="flex flex-wrap gap-2">
                    {targetUsers.map((audience, i) => (
                      <Badge key={i} variant="secondary" className="bg-secondary text-[#65686f]">
                        {audience}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-[#65686f]">{targetUsers}</p>
                )}
              </CardContent>
            </Card>
          )}

          {/* Core Features */}
          {coreFeatures.length > 0 && (
            <Card className="bg-[#161e2a] border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  Core Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid md:grid-cols-2 gap-2">
                  {coreFeatures.map((feature, i) => (
                    <li key={i} className="text-sm text-[#65686f] flex gap-2">
                      <span className="text-primary">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* MVP Scope */}
          {mvpScope.length > 0 && (
            <Card className="bg-[#161e2a] border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">MVP Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {mvpScope.map((item, i) => (
                    <li key={i} className="text-sm text-[#65686f] flex gap-2">
                      <span className="text-green-500">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Success Metrics */}
          {successMetrics.length > 0 && (
            <Card className="bg-[#161e2a] border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {successMetrics.map((metric, i) => (
                    <Badge key={i} variant="outline" className="border-border text-[#65686f]">
                      {metric}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Timeline */}
          {timeline && (
            <Card className="bg-[#161e2a] border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-[#65686f]">{timeline}</p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
