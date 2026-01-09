import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useArtifact } from '@/hooks/useArtifact';
import { Loader2, FileText, Target, Lightbulb, CheckCircle2, Users } from 'lucide-react';

interface ProductBriefContent {
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
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  const content = artifact?.content as ProductBriefContent | null;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Product Brief</h1>
          <p className="text-muted-foreground mt-1">
            Your comprehensive product requirements document
          </p>
        </div>

        {error && (
          <Card className="border-destructive">
            <CardContent className="p-4">
              <p className="text-destructive text-sm">Failed to load product brief</p>
            </CardContent>
          </Card>
        )}

        {!artifact ? (
          <Card className="glass">
            <CardContent className="p-8 text-center">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Product Brief Yet</h3>
              <p className="text-muted-foreground text-sm">
                Generate a product brief using the AI assistant to see it here.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Title & Summary */}
            {(content?.title || content?.summary) && (
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-xl">{content?.title || 'Product Brief'}</CardTitle>
                </CardHeader>
                {content?.summary && (
                  <CardContent>
                    <p className="text-muted-foreground">{content.summary}</p>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Problem & Solution */}
            <div className="grid md:grid-cols-2 gap-4">
              {content?.problem && (
                <Card className="glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Target className="w-4 h-4 text-destructive" />
                      Problem
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{content.problem}</p>
                  </CardContent>
                </Card>
              )}

              {content?.solution && (
                <Card className="glass">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-primary" />
                      Solution
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{content.solution}</p>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Target Audience */}
            {content?.targetAudience && (
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Users className="w-4 h-4 text-accent" />
                    Target Audience
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {Array.isArray(content.targetAudience) ? (
                    <div className="flex flex-wrap gap-2">
                      {content.targetAudience.map((audience, i) => (
                        <Badge key={i} variant="secondary">
                          {audience}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{content.targetAudience}</p>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Key Features */}
            {content?.keyFeatures && content.keyFeatures.length > 0 && (
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                    Key Features
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid md:grid-cols-2 gap-2">
                    {content.keyFeatures.map((feature, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-primary">•</span>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* MVP Scope */}
            {content?.mvpScope && content.mvpScope.length > 0 && (
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">MVP Scope</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {content.mvpScope.map((item, i) => (
                      <li key={i} className="text-sm text-muted-foreground flex gap-2">
                        <span className="text-accent">✓</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {/* Success Metrics */}
            {content?.successMetrics && content.successMetrics.length > 0 && (
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Success Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {content.successMetrics.map((metric, i) => (
                      <Badge key={i} variant="outline">
                        {metric}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Timeline */}
            {content?.timeline && (
              <Card className="glass">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Timeline</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{content.timeline}</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
