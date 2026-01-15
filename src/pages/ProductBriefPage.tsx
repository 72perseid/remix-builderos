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
  const {
    data: artifact,
    loading,
    error
  } = useArtifact('product_brief');
  if (loading) {
    return <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>;
  }
  const content = artifact?.content as ProductBriefContent | null;
  return <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Product Brief</h1>
        <p className="text-slate-400 mt-1">
          Your comprehensive product requirements document
        </p>
      </div>

      {error && <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <p className="text-red-400 text-sm">Failed to load product brief</p>
          </CardContent>
        </Card>}

      {!artifact ? <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <FileText className="w-12 h-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-primary-foreground">No Product Brief Yet</h3>
            <p className="text-slate-400 text-sm">
              Generate a product brief using the AI assistant to see it here.
            </p>
          </CardContent>
        </Card> : <div className="space-y-6">
          {/* Title & Summary */}
          {(content?.title || content?.summary) && <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-xl text-white">{content?.title || 'Product Brief'}</CardTitle>
              </CardHeader>
              {content?.summary && <CardContent>
                  <p className="text-slate-400">{content.summary}</p>
                </CardContent>}
            </Card>}

          {/* Problem & Solution */}
          <div className="grid md:grid-cols-2 gap-4">
            {content?.problem && <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Target className="w-4 h-4 text-red-500" />
                    Problem
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400">{content.problem}</p>
                </CardContent>
              </Card>}

            {content?.solution && <Card className="bg-slate-800/50 border-slate-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2 text-white">
                    <Lightbulb className="w-4 h-4 text-blue-500" />
                    Solution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-slate-400">{content.solution}</p>
                </CardContent>
              </Card>}
          </div>

          {/* Target Audience */}
          {content?.targetAudience && <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <Users className="w-4 h-4 text-purple-500" />
                  Target Audience
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Array.isArray(content.targetAudience) ? <div className="flex flex-wrap gap-2">
                    {content.targetAudience.map((audience, i) => <Badge key={i} variant="secondary" className="bg-slate-700 text-slate-300">
                        {audience}
                      </Badge>)}
                  </div> : <p className="text-sm text-slate-400">{content.targetAudience}</p>}
              </CardContent>
            </Card>}

          {/* Key Features */}
          {content?.keyFeatures && content.keyFeatures.length > 0 && <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2 text-white">
                  <CheckCircle2 className="w-4 h-4 text-blue-500" />
                  Key Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="grid md:grid-cols-2 gap-2">
                  {content.keyFeatures.map((feature, i) => <li key={i} className="text-sm text-slate-400 flex gap-2">
                      <span className="text-blue-500">•</span>
                      {feature}
                    </li>)}
                </ul>
              </CardContent>
            </Card>}

          {/* MVP Scope */}
          {content?.mvpScope && content.mvpScope.length > 0 && <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">MVP Scope</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {content.mvpScope.map((item, i) => <li key={i} className="text-sm text-slate-400 flex gap-2">
                      <span className="text-green-500">✓</span>
                      {item}
                    </li>)}
                </ul>
              </CardContent>
            </Card>}

          {/* Success Metrics */}
          {content?.successMetrics && content.successMetrics.length > 0 && <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Success Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {content.successMetrics.map((metric, i) => <Badge key={i} variant="outline" className="border-slate-600 text-slate-300">
                      {metric}
                    </Badge>)}
                </div>
              </CardContent>
            </Card>}

          {/* Timeline */}
          {content?.timeline && <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-white">Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-400">{content.timeline}</p>
              </CardContent>
            </Card>}
        </div>}
    </div>;
}