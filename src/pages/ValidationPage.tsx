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
    return <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>;
  }
  const content = artifact?.content as ValidationContent | null;
  const personas = content?.personas || content?.user_personas || [];
  return <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Validation Strategy</h1>
        <p className="mt-1 text-primary-foreground">
          User personas and validation insights for your app
        </p>
      </div>

      {error && <Card className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-4">
            <p className="text-red-400 text-sm">Failed to load validation data</p>
          </CardContent>
        </Card>}

      {!artifact ? <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8 text-center">
            <Users className="w-12 h-12 mx-auto text-slate-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2 text-white">No Validation Data Yet</h3>
            <p className="text-slate-400 text-sm">
              Generate user personas using the AI assistant to see them here.
            </p>
          </CardContent>
        </Card> : <div className="space-y-6">
          {/* Personas Grid */}
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-white">
              <User className="w-5 h-5 text-blue-500" />
              User Personas
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {personas.map((persona, index) => <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2 text-white">
                      <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold">{persona.name}</p>
                        {persona.role && <p className="text-xs text-slate-400 font-normal">
                            {persona.role}
                          </p>}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Demographics */}
                    {(persona.age || persona.demographics) && <div className="flex flex-wrap gap-1">
                        {persona.age && <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                            Age: {persona.age}
                          </Badge>}
                        {persona.demographics && <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300">
                            {persona.demographics}
                          </Badge>}
                      </div>}

                    {/* Bio */}
                    {persona.bio && <p className="text-sm text-slate-400">{persona.bio}</p>}

                    {/* Goals */}
                    {persona.goals && persona.goals.length > 0 && <div>
                        <p className="text-xs font-semibold text-blue-500 flex items-center gap-1 mb-1">
                          <Target className="w-3 h-3" /> Goals
                        </p>
                        <ul className="space-y-1">
                          {persona.goals.map((goal, i) => <li key={i} className="text-xs text-slate-400 flex gap-2">
                              <span className="text-blue-500">•</span>
                              {goal}
                            </li>)}
                        </ul>
                      </div>}

                    {/* Pain Points */}
                    {persona.painPoints && persona.painPoints.length > 0 && <div>
                        <p className="text-xs font-semibold text-red-500 flex items-center gap-1 mb-1">
                          <AlertTriangle className="w-3 h-3" /> Pain Points
                        </p>
                        <ul className="space-y-1">
                          {persona.painPoints.map((pain, i) => <li key={i} className="text-xs text-slate-400 flex gap-2">
                              <span className="text-red-500">•</span>
                              {pain}
                            </li>)}
                        </ul>
                      </div>}
                  </CardContent>
                </Card>)}
            </div>
          </div>
        </div>}
    </div>;
}