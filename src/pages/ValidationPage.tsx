import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessCard } from '@/components/ui/business-card';
import { useArtifact } from '@/hooks/useArtifact';
import { Loader2, Users, Target, AlertTriangle, User } from 'lucide-react';
import { ArtifactBreadcrumb } from '@/components/dashboard/ArtifactBreadcrumb';
import { CopilotPanel } from '@/components/artifacts/ArtifactCopilot';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useProjectContext } from '@/contexts/ProjectContext';

interface Persona {
  name: string;
  role?: string;
  age?: string | number;
  demographics?: string;
  bio?: string;
  goals?: string[];
  painPoints?: string[];
  motivations?: string[];
}

interface ValidationContent {
  personas?: Persona[];
  user_personas?: Persona[];
}

export default function ValidationPage() {
  const { data: artifact, loading, error, refetch: refetchArtifact } = useArtifact('validation');
  const { selectedAppId } = useProjectContext();

  const { data: completionData } = useQuery({
    queryKey: ['app-completion-uv', selectedAppId],
    queryFn: async () => {
      if (!selectedAppId) return null;
      const { data } = await supabase
        .from('app_ideas')
        .select('uv_completion')
        .eq('id', selectedAppId)
        .maybeSingle();
      return data;
    },
    enabled: !!selectedAppId,
    refetchInterval: 10000,
  });

  const uvCompletion = (completionData as any)?.uv_completion ?? 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const content = artifact?.content as ValidationContent | null;
  const personas = content?.personas || content?.user_personas || [];

  return (
    <div className="h-dvh flex flex-col overflow-hidden">
      <div className="px-6 pt-4 pb-2 shrink-0 border-b border-slate-800/50">
        <ArtifactBreadcrumb currentPage="Validation Strategy" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <CopilotPanel context="validation" heading="User Researcher" onArtifactRefresh={refetchArtifact} />
        <div className="flex-1 overflow-auto p-6">
          <div className="max-w-full space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Validation Strategy</h1>
                <p className="mt-1 text-secondary-foreground">User personas and validation insights for your app</p>
              </div>
              {uvCompletion > 0 && (
                <div className="w-40 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-muted-foreground">Completion</span>
                    <span className="text-xs font-semibold text-blue-400">{uvCompletion}%</span>
                  </div>
                  <Progress value={uvCompletion} className="h-1.5 bg-slate-700/50" />
                </div>
              )}
            </div>

            {error && (
              <Card className="border-red-500/50 bg-red-500/10">
                <CardContent className="p-4">
                  <p className="text-red-400 text-base">Failed to load validation data</p>
                </CardContent>
              </Card>
            )}

            {!artifact ? (
              <Card className="bg-card border-slate-700/50">
                <CardContent className="p-8 text-center">
                  <Users className="w-12 h-12 mx-auto text-secondary-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2 text-white">No Validation Data Yet</h3>
                  <p className="text-secondary-foreground text-base">
                    Generate user personas using the AI assistant to see them here.
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
                <div>
                  <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                    <User className="w-5 h-5 text-blue-500" />
                    User Personas
                  </h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {personas.map((persona, index) => (
                      <BusinessCard key={index} title={persona.name} icon={User} iconColor="text-blue-500">
                        <div className="space-y-4">
                          {persona.role && <p className="text-secondary-foreground">{persona.role}</p>}
                          {(persona.age || persona.demographics) && (
                            <div className="flex flex-wrap gap-2">
                              {persona.age && <Badge variant="secondary" className="text-sm bg-white/5 border border-white/10 text-secondary-foreground">{persona.age}</Badge>}
                              {persona.demographics && <Badge variant="secondary" className="text-sm bg-white/5 border border-white/10 text-secondary-foreground">{persona.demographics}</Badge>}
                            </div>
                          )}
                          {persona.bio && <p>{persona.bio}</p>}
                          {persona.goals && persona.goals.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-blue-500 flex items-center gap-1.5 mb-2"><Target className="w-4 h-4" /> Goals</p>
                              <ul className="space-y-1.5">
                                {persona.goals.map((goal, i) => (
                                  <li key={i} className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">•</span>{goal}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                          {persona.painPoints && persona.painPoints.length > 0 && (
                            <div>
                              <p className="text-sm font-semibold text-red-500 flex items-center gap-1.5 mb-2"><AlertTriangle className="w-4 h-4" /> Pain Points</p>
                              <ul className="space-y-1.5">
                                {persona.painPoints.map((pain, i) => (
                                  <li key={i} className="flex items-start gap-2"><span className="text-red-500 mt-0.5">•</span>{pain}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </BusinessCard>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}