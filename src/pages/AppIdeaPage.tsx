import { useState } from 'react';
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
    
    // TODO: Replace with actual n8n webhook call
    setTimeout(() => {
      setIsGenerating(false);
      toast.info('AI generation not yet configured');
    }, 1000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">My App Idea</h1>
        <p className="text-slate-400 mt-1">Define your app concept and let AI help you refine it</p>
      </div>

      {/* Input Form */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-lg text-white">App Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="appName" className="text-slate-300">App Name</Label>
            <Input
              id="appName"
              value={appName}
              onChange={(e) => setAppName(e.target.value)}
              placeholder="Enter your app name..."
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="appDescription" className="text-slate-300">App Description</Label>
            <Textarea
              id="appDescription"
              value={appDescription}
              onChange={(e) => setAppDescription(e.target.value)}
              placeholder="Describe what your app does, the problem it solves, and who it's for..."
              rows={5}
              className="bg-slate-900/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
          <div className="flex gap-3">
            <Button onClick={handleSave} variant="outline" className="border-slate-600 text-slate-300 hover:bg-slate-700">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button onClick={handleGenerate} disabled={isGenerating} className="bg-blue-600 hover:bg-blue-700">
              <Sparkles className="w-4 h-4 mr-2" />
              {isGenerating ? 'Generating...' : 'Generate AI Profile'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Content */}
      {appIdea?.ideaGeneration && (
        <div className="grid md:grid-cols-2 gap-4 animate-fade-in">
          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <Target className="w-4 h-4 text-blue-500" />
                Problem Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                {appIdea.ideaGeneration.problemStatement}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <Users className="w-4 h-4 text-purple-500" />
                Target Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-400">
                {appIdea.ideaGeneration.targetUsers}
              </p>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <Zap className="w-4 h-4 text-orange-500" />
                Core Features
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {appIdea.ideaGeneration.coreFeatures?.map((feature, i) => (
                  <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                    <span className="text-blue-500 mt-1">•</span>
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2 text-white">
                <Award className="w-4 h-4 text-yellow-500" />
                Differentiators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1">
                {appIdea.ideaGeneration.differentiators?.map((diff, i) => (
                  <li key={i} className="text-sm text-slate-400 flex items-start gap-2">
                    <span className="text-purple-500 mt-1">•</span>
                    {diff}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
