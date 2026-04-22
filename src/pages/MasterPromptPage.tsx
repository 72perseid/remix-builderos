import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useArtifact } from '@/hooks/useArtifact';
import { useArtifacts } from '@/hooks/useArtifacts';
import { useCopilotChat } from '@/hooks/useCopilotChat';
import { toast } from 'sonner';
import { FileCode, Loader2, Copy, Check, Sparkles, AlertTriangle, Link2, Lock } from 'lucide-react';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CoachCTA } from '@/components/dashboard/CoachCTA';
import { useEnrollment } from '@/hooks/useEnrollment';
import { useIsAdmin } from '@/hooks/useIsAdmin';

// Prerequisites configuration
const REQUIRED_ARTIFACTS = ['business_model', 'db_design', 'validation', 'product_brief'] as const;

const ARTIFACT_LABELS: Record<string, {label: string;route: string;}> = {
  business_model: { label: 'Business Model', route: '/business-model' },
  db_design: { label: 'Database Design', route: '/database-design' },
  validation: { label: 'Validation Strategy', route: '/validation' },
  product_brief: { label: 'Product Brief', route: '/product-brief' }
};

// Helper to extract the prompt text from various formats
function parsePromptContent(rawContent: unknown): string | null {
  if (!rawContent) return null;

  // If already a string, return as-is
  if (typeof rawContent === 'string') {
    // Try to extract from markdown code block
    const jsonMatch = rawContent.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch && jsonMatch[1]) {
      try {
        const parsed = JSON.parse(jsonMatch[1]);
        return parsed.prompt || parsed.masterPrompt || parsed.content || JSON.stringify(parsed, null, 2);
      } catch {
        // Not JSON, return the raw string
        return rawContent;
      }
    }

    // Try direct JSON parse
    try {
      const parsed = JSON.parse(rawContent);
      return parsed.prompt || parsed.masterPrompt || parsed.content || JSON.stringify(parsed, null, 2);
    } catch {
      // Not JSON, return raw string
      return rawContent;
    }
  }

  // If object, extract prompt field or stringify
  if (typeof rawContent === 'object' && rawContent !== null) {
    const obj = rawContent as Record<string, unknown>;
    if (typeof obj.prompt === 'string') return obj.prompt;
    if (typeof obj.masterPrompt === 'string') return obj.masterPrompt;
    if (typeof obj.content === 'string') return obj.content;
    return JSON.stringify(rawContent, null, 2);
  }

  return null;
}

export default function MasterPromptPage() {
  const navigate = useNavigate();
  const { data: artifact, loading: artifactLoading, refetch: refetchArtifact } = useArtifact('master_prompt');
  const { artifacts: allArtifacts, loading: artifactsLoading } = useArtifacts();
  const { sendMessage, isLoading: isGenerating } = useCopilotChat({
    context: 'master_prompt',
    onArtifactRefresh: refetchArtifact
  });
  const [copied, setCopied] = useState(false);

  // Calculate missing prerequisites
  const missingArtifacts = REQUIRED_ARTIFACTS.filter(
    (type) => !allArtifacts.some((a) => a.type === type)
  );
  const isUnlocked = missingArtifacts.length === 0;
  const promptContent = parsePromptContent(artifact?.content);

  const handleCopy = async () => {
    if (!promptContent) return;

    try {
      await navigator.clipboard.writeText(promptContent);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleGeneratePrompt = async () => {
    await sendMessage('Generate my master prompt by combining all my project artifacts');
  };

  // Combined loading state
  if (artifactLoading || artifactsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>);

  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-full space-y-6 p-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Master Prompt</h1>
            <p className="text-white/80 mt-1">
              This prompt aggregates your Business Model, Roadmap, and Database Design into a single context for AI coding tools.
            </p>
          </div>

          {/* Locked State - Prerequisites Missing */}
          {!isUnlocked &&
        <Card className="bg-amber-500/10 border-amber-500/30">
              <CardContent className="p-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-6 h-6 text-amber-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-amber-400 mb-2">
                      Prerequisites Missing
                    </h3>
                    <p className="text-white/80 text-sm mb-4">
                      Complete the following artifacts before generating your Master Prompt:
                    </p>
                    <ul className="space-y-2">
                      {missingArtifacts.map((type) =>
                  <li key={type}>
                          <Button
                      variant="link"
                      className="text-primary p-0 h-auto"
                      onClick={() => navigate(ARTIFACT_LABELS[type].route)}>

                            <Link2 className="w-4 h-4 mr-2" />
                            {ARTIFACT_LABELS[type].label}
                          </Button>
                        </li>
                  )}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
        }

          {/* Ready State - Unlocked but Empty */}
          {isUnlocked && !promptContent &&
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}>

              <Card className="relative overflow-hidden rounded-2xl bg-card border border-slate-700/50">

                <CardContent className="relative p-12 text-center">
                  {/* Icon with glow effect */}
                  <div className="mb-6">
                    <div className="relative inline-flex">
                      <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
                      <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                        <Sparkles className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-3">Ready to Generate</h3>
                  <p className="text-white font-normal text-base mb-8 max-w-lg mx-auto leading-relaxed">
                    All prerequisites complete! Generate a comprehensive prompt that combines all your project context (Business Model, Database Design, Features) into one document you can paste into any AI coding tool.
                  </p>
                  
                  <Button
                variant="default"
                size="lg"
                className="gap-2 px-8"
                onClick={handleGeneratePrompt}
                disabled={isGenerating}>

                    {isGenerating ?
                <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </> :

                <>
                        <Sparkles className="w-4 h-4" />
                        Generate Master Prompt
                      </>
                }
                  </Button>

                  {/* Decorative lines */}
                  <div className="absolute bottom-4 right-4 flex gap-1">
                    <div className="w-8 h-0.5 rounded-full bg-primary/20" />
                    <div className="w-4 h-0.5 rounded-full bg-primary/10" />
                    <div className="w-2 h-0.5 rounded-full bg-primary/5" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
        }

          {/* Content State - Prompt Generated */}
          {isUnlocked && promptContent &&
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}>

              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-white">Generated Prompt</h2>
                <Button
              size="sm"
              onClick={handleCopy}
              className={cn(
                "gap-2 rounded-full transition-colors",
                copied ? "bg-green-500/20 border-green-500/50 text-green-400" : "bg-primary hover:bg-primary/90 text-white"
              )}>

                  {copied ?
              <>
                      <Check className="w-4 h-4" />
                      Copied!
                    </> :

              <>
                      <Copy className="w-4 h-4" />
                      Copy to Clipboard
                    </>
              }
                </Button>
              </div>

              {/* Code Block with floating copy button */}
              <div className="relative group">
                <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                variant="secondary"
                size="icon"
                onClick={handleCopy}
                className={cn(
                  "h-8 w-8 bg-slate-700 hover:bg-slate-600 border-slate-600",
                  copied && "bg-green-500/20 border-green-500/50"
                )}>

                    {copied ?
                <Check className="w-4 h-4 text-green-400" /> :

                <Copy className="w-4 h-4" />
                }
                  </Button>
                </div>
                
                <pre className="bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-auto max-h-[60vh] text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                  {promptContent}
                </pre>
              </div>

              <p className="text-xs text-white/70 text-center">
                Copy this prompt and paste it into Lovable or any AI tool to give it full context about your project.
              </p>
          </motion.div>
        }

        {/* Coach CTA */}
        <CoachCTA message="Want someone to run this for you?" ctaLabel="Talk to an Expert" />
      </div>
    </div>);

}