import { Button } from '@/components/ui/button';
import { Sparkles, Rocket } from 'lucide-react';

interface ArchitectBannerProps {
  onStartBuilding: () => void;
  hasData?: boolean;
}

export function ArchitectBanner({ onStartBuilding, hasData }: ArchitectBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-slate-700/50 bg-[#161e2a] p-6 mb-6">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-blue-400/5 to-cyan-500/5" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      
      <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/20">
            <Sparkles className="h-6 w-6 text-blue-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-white mb-1">
              BuilderOS Architect
            </h2>
            <p className="text-slate-400 text-sm max-w-md">
              {hasData 
                ? "Your project artifacts are ready. Chat with the AI to refine or regenerate them."
                : "Chat with the AI to generate your entire project plan, roadmap, and specs in one go."
              }
            </p>
          </div>
        </div>
        
        <Button
          onClick={onStartBuilding}
          size="lg"
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white shadow-lg shadow-blue-500/20 transition-all hover:shadow-blue-500/30"
        >
          <Rocket className="h-4 w-4 mr-2" />
          {hasData ? 'Continue Building' : 'Start Building'}
        </Button>
      </div>
    </div>
  );
}
