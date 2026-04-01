import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useArtifacts } from '@/hooks/useArtifacts';
import { useCopilotChat } from '@/hooks/useCopilotChat';
import { toast } from 'sonner';
import { Rocket, Loader2, Copy, Check, Sparkles, AlertTriangle, Link2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { CoachCTA } from '@/components/dashboard/CoachCTA';

const REQUIRED_ARTIFACTS = ['business_model', 'product_brief'] as const;

const ARTIFACT_LABELS: Record<string, { label: string; route: string }> = {
  business_model: { label: 'Business Model', route: '/business-model' },
  product_brief: { label: 'Product Brief', route: '/product-brief' },
};

export default function LandingPageGeneratorPage() {
  const navigate = useNavigate();
  const { artifacts: allArtifacts, loading: artifactsLoading } = useArtifacts();
  const [generatedPrompt, setGeneratedPrompt] = useState<string | null>(null);
  const { sendMessage, isLoading: isGenerating } = useCopilotChat({
    context: 'landing_page',
  });
  const [copied, setCopied] = useState(false);

  const missingArtifacts = REQUIRED_ARTIFACTS.filter(
    (type) => !allArtifacts.some((a) => a.type === type)
  );
  const isUnlocked = missingArtifacts.length === 0;

  const handleCopy = async () => {
    if (!generatedPrompt) return;
    try {
      await navigator.clipboard.writeText(generatedPrompt);
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleGenerate = async () => {
    const response = await sendMessage('Generate a detailed landing page prompt using my project artifacts. Include SEO metadata, headline, subheadline, hero section, problem statement, features, how-it-works steps, social proof, CTA, color palette, and responsive design instructions.');
    if (response) {
      setGeneratedPrompt(response);
    }
  };

  if (artifactsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="max-w-full space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Landing Page Prompt</h1>
          <p className="text-white/80 mt-1">
            Generate a prompt to build a conversion-optimized landing page with any AI coding tool.
          </p>
        </div>

        {/* Prerequisites Missing */}
        {!isUnlocked && (
          <Card className="bg-amber-500/10 border-amber-500/30">
            <CardContent className="p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-amber-400 mb-2">Prerequisites Missing</h3>
                  <p className="text-white/80 text-sm mb-4">
                    Complete the following artifacts before generating your Landing Page Prompt:
                  </p>
                  <ul className="space-y-2">
                    {missingArtifacts.map((type) => (
                      <li key={type}>
                        <Button
                          variant="link"
                          className="text-primary p-0 h-auto"
                          onClick={() => navigate(ARTIFACT_LABELS[type].route)}
                        >
                          <Link2 className="w-4 h-4 mr-2" />
                          {ARTIFACT_LABELS[type].label}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ready to Generate */}
        {isUnlocked && !promptContent && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          >
            <Card className="relative overflow-hidden rounded-2xl bg-card border border-slate-700/50">
              <CardContent className="relative p-12 text-center">
                <div className="mb-6">
                  <div className="relative inline-flex">
                    <div className="absolute inset-0 rounded-2xl bg-primary/20 blur-xl" />
                    <div className="relative flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20">
                      <Rocket className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-3">Ready to Generate</h3>
                <p className="text-white font-normal text-base mb-8 max-w-lg mx-auto leading-relaxed">
                  All prerequisites complete! Generate a comprehensive landing page prompt that includes SEO metadata, copy, layout, and design — ready to paste into Cursor, Bolt, Replit, or any AI coding tool.
                </p>

                <Button
                  variant="default"
                  size="lg"
                  className="gap-2 px-8"
                  onClick={handleGenerate}
                  disabled={isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Landing Page Prompt
                    </>
                  )}
                </Button>

                <div className="absolute bottom-4 right-4 flex gap-1">
                  <div className="w-8 h-0.5 rounded-full bg-primary/20" />
                  <div className="w-4 h-0.5 rounded-full bg-primary/10" />
                  <div className="w-2 h-0.5 rounded-full bg-primary/5" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Prompt Generated */}
        {isUnlocked && promptContent && (
          <motion.div
            className="space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Generated Prompt</h2>
              <Button
                size="sm"
                onClick={handleCopy}
                className={cn(
                  'gap-2 rounded-full transition-colors',
                  copied
                    ? 'bg-green-500/20 border-green-500/50 text-green-400'
                    : 'bg-primary hover:bg-primary/90 text-white'
                )}
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copy to Clipboard
                  </>
                )}
              </Button>
            </div>

            <div className="relative group">
              <div className="absolute top-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={handleCopy}
                  className={cn(
                    'h-8 w-8 bg-slate-700 hover:bg-slate-600 border-slate-600',
                    copied && 'bg-green-500/20 border-green-500/50'
                  )}
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>

              <pre className="bg-slate-900 border border-slate-800 rounded-xl p-6 overflow-auto max-h-[60vh] text-sm text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">
                {promptContent}
              </pre>
            </div>

            <p className="text-xs text-white/70 text-center">
              Copy this prompt and paste it into Cursor, Bolt, Replit, or any AI coding tool to build your landing page.
            </p>
          </motion.div>
        )}

        <CoachCTA message="Need help crafting the perfect landing page?" ctaLabel="Talk to an Expert" />
      </div>
    </div>
  );
}
