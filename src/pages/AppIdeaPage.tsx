import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAppIdea } from '@/hooks/useAppIdea';
import { toast } from 'sonner';
import { Save, Sparkles, Target, Users, Zap, Award } from 'lucide-react';

export default function AppIdeaPage() {
  const { appIdea, saveAppIdea, updateGeneratedContent } = useAppIdea();
  const [appName, setAppName] = useState(appIdea?.appName || '');
  const [appDescription, setAppDescription] = useState(appIdea?.appDescription || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSave = () => {
    saveAppIdea({ appName, appDescription });
    toast.success('App idea saved!');
  };

  const handleGenerate = async () => {
    if (!appName || !appDescription) {
      toast.error('Please fill in both fields first');
      return;
    }

    setIsGenerating(true);
    
    // Placeholder for n8n webhook - simulating AI response
    setTimeout(() => {
      const mockGenerated = {
        problemStatement: `${appName} solves the challenge of ${appDescription.slice(0, 50)}... by providing an intuitive and efficient solution.`,
        targetUsers: 'Tech-savvy professionals, startups, and small business owners who need streamlined workflows.',
        coreFeatures: [
          'Intuitive drag-and-drop interface',
          'Real-time collaboration',
          'AI-powered suggestions',
          'Custom integrations',
          'Analytics dashboard',
        ],
        differentiators: [
          'AI-first approach to problem solving',
          'No-code customization options',
          'Built-in best practices templates',
          'Seamless third-party integrations',
        ],
      };
      
      updateGeneratedContent(mockGenerated);
      saveAppIdea({ appName, appDescription, ideaGeneration: mockGenerated });
      setIsGenerating(false);
      toast.success('AI profile generated!');
    }, 2000);
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">My App Idea</h1>
          <p className="text-muted-foreground mt-1">Define your app concept and let AI help you refine it</p>
        </div>

        {/* Input Form */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg">App Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="appName">App Name</Label>
              <Input
                id="appName"
                value={appName}
                onChange={(e) => setAppName(e.target.value)}
                placeholder="Enter your app name..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appDescription">App Description</Label>
              <Textarea
                id="appDescription"
                value={appDescription}
                onChange={(e) => setAppDescription(e.target.value)}
                placeholder="Describe what your app does, the problem it solves, and who it's for..."
                rows={5}
              />
            </div>
            <div className="flex gap-3">
              <Button onClick={handleSave} variant="outline">
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
              <Button onClick={handleGenerate} disabled={isGenerating}>
                <Sparkles className="w-4 h-4 mr-2" />
                {isGenerating ? 'Generating...' : 'Generate AI Profile'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Generated Content */}
        {appIdea?.ideaGeneration && (
          <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Target className="w-4 h-4 text-primary" />
                  Problem Statement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {appIdea.ideaGeneration.problemStatement}
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Users className="w-4 h-4 text-accent" />
                  Target Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {appIdea.ideaGeneration.targetUsers}
                </p>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Zap className="w-4 h-4 text-category-stretch" />
                  Core Features
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {appIdea.ideaGeneration.coreFeatures?.map((feature, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="glass">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Award className="w-4 h-4 text-priority-medium" />
                  Differentiators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1">
                  {appIdea.ideaGeneration.differentiators?.map((diff, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-accent mt-1">•</span>
                      {diff}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
