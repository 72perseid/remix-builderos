import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useArtifact } from '@/hooks/useArtifact';
import { Loader2, Users, Target, AlertTriangle, User } from 'lucide-react';

interface Persona {
  name: string;
  role?: string;
  age?: string | number;
  demographics?: string;
  bio?: string;
  goals?: string[];
  pain_points?: string[];  // snake_case from DB
  painPoints?: string[];   // legacy camelCase support
  motivations?: string[];
}

interface ValidationContent {
  personas?: Persona[];
  user_personas?: Persona[];
}

export default function ValidationPage() {
  const { data: artifact, loading, error } = useArtifact('validation');

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
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Validation Strategy</h1>
        <p className="text-muted-foreground mt-1">
          User personas and validation insights for your app
        </p>
      </div>

      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="p-4">
            <p className="text-destructive text-sm">Failed to load validation data</p>
          </CardContent>
        </Card>
      )}

      {!artifact ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No Validation Data Yet</h3>
            <p className="text-muted-foreground text-sm">
              Generate user personas using the AI Architect on the Dashboard.
            </p>
          </CardContent>
        </Card>
      ) : personas.length === 0 ? (
        <Card className="bg-card/50 border-border">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-foreground">No Personas Found</h3>
            <p className="text-muted-foreground text-sm">
              The validation data exists but no personas were generated.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Personas Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground">
              <User className="w-5 h-5 text-primary" />
              User Personas
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personas.map((persona, index) => {
                // Normalize pain_points (handle both formats)
                const painPoints = persona.pain_points || persona.painPoints || [];
                
                return (
                  <Card key={index} className="bg-card/50 border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2 text-foreground">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <User className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold">{persona.name}</p>
                          {persona.role && (
                            <p className="text-xs text-muted-foreground font-normal">
                              {persona.role}
                            </p>
                          )}
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Demographics */}
                      {(persona.age || persona.demographics) && (
                        <div className="flex flex-wrap gap-1">
                          {persona.age && (
                            <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                              Age: {persona.age}
                            </Badge>
                          )}
                          {persona.demographics && (
                            <Badge variant="secondary" className="text-xs bg-secondary text-secondary-foreground">
                              {persona.demographics}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* Bio */}
                      {persona.bio && (
                        <p className="text-sm text-muted-foreground">{persona.bio}</p>
                      )}

                      {/* Goals */}
                      {persona.goals && persona.goals.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-primary flex items-center gap-1 mb-1">
                            <Target className="w-3 h-3" /> Goals
                          </p>
                          <ul className="space-y-1">
                            {persona.goals.map((goal, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex gap-2">
                                <span className="text-primary">•</span>
                                {goal}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Pain Points */}
                      {painPoints.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mb-1">
                            <AlertTriangle className="w-3 h-3" /> Pain Points
                          </p>
                          <ul className="space-y-1">
                            {painPoints.map((pain, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex gap-2">
                                <span className="text-red-500">•</span>
                                {pain}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Motivations */}
                      {persona.motivations && persona.motivations.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-green-500 flex items-center gap-1 mb-1">
                            Motivations
                          </p>
                          <ul className="space-y-1">
                            {persona.motivations.map((motivation, i) => (
                              <li key={i} className="text-xs text-muted-foreground flex gap-2">
                                <span className="text-green-500">•</span>
                                {motivation}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
