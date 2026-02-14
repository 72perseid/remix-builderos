import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { BusinessCard } from '@/components/ui/business-card';
import { useArtifact } from '@/hooks/useArtifact';
import { Loader2, Users, Target, AlertTriangle, User } from 'lucide-react';
import { ArtifactBackButton } from '@/components/dashboard/ArtifactBackButton';
import { ArtifactCopilot } from '@/components/artifacts/ArtifactCopilot';
import { motion } from 'framer-motion';

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
  const {
    data: artifact,
    loading,
    error
  } = useArtifact('validation');

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const content = artifact?.content as ValidationContent | null;
  const personas = content?.personas || content?.user_personas || [];

  return (
    <div className="flex h-full bg-[#0B0E14] min-h-screen">
      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-6xl mx-auto space-y-6 p-6">
          <ArtifactBackButton />
          <div>
            <h1 className="text-2xl font-bold text-white">Validation Strategy</h1>
            <p className="mt-1 text-muted-foreground">
              User personas and validation insights for your app
            </p>
          </div>

          {error && (
            <Card className="border-red-500/50 bg-red-500/10">
              <CardContent className="p-4">
                <p className="text-red-400 text-base">Failed to load validation data</p>
              </CardContent>
            </Card>
          )}

          {!artifact ? (
            <Card className="bg-[#161e2a] border-slate-700/50">
              <CardContent className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-white">No Validation Data Yet</h3>
                <p className="text-muted-foreground text-base">
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
              {/* Personas Grid */}
              <div>
                <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
                  <User className="w-5 h-5 text-blue-500" />
                  User Personas
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {personas.map((persona, index) => (
                    <BusinessCard 
                      key={index} 
                      title={persona.name}
                      icon={User}
                      iconColor="text-blue-500"
                    >
                      <div className="space-y-4">
                        {/* Role */}
                        {persona.role && (
                          <p className="text-muted-foreground">{persona.role}</p>
                        )}

                        {/* Demographics */}
                        {(persona.age || persona.demographics) && (
                          <div className="flex flex-wrap gap-2">
                            {persona.age && (
                              <Badge variant="secondary" className="text-sm bg-white/5 border border-white/10 text-muted-foreground">
                                {persona.age}
                              </Badge>
                            )}
                            {persona.demographics && (
                              <Badge variant="secondary" className="text-sm bg-white/5 border border-white/10 text-muted-foreground">
                                {persona.demographics}
                              </Badge>
                            )}
                          </div>
                        )}

                        {/* Bio */}
                        {persona.bio && (
                          <p>{persona.bio}</p>
                        )}

                        {/* Goals */}
                        {persona.goals && persona.goals.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-blue-500 flex items-center gap-1.5 mb-2">
                              <Target className="w-4 h-4" /> Goals
                            </p>
                            <ul className="space-y-1.5">
                              {persona.goals.map((goal, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-blue-500 mt-0.5">•</span>
                                  {goal}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Pain Points */}
                        {persona.painPoints && persona.painPoints.length > 0 && (
                          <div>
                            <p className="text-sm font-semibold text-red-500 flex items-center gap-1.5 mb-2">
                              <AlertTriangle className="w-4 h-4" /> Pain Points
                            </p>
                            <ul className="space-y-1.5">
                              {persona.painPoints.map((pain, i) => (
                                <li key={i} className="flex items-start gap-2">
                                  <span className="text-red-500 mt-0.5">•</span>
                                  {pain}
                                </li>
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

      {/* Copilot Sidebar */}
      <ArtifactCopilot context="validation" heading="User Researcher" />
    </div>
  );
}
