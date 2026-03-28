import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Circle, ArrowRight, Zap } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useArtifacts } from '@/hooks/useArtifacts';
import { useProjectContext } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';
import type { Database } from '@/integrations/supabase/types';

type ArtifactType = Database['public']['Enums']['artifact_type'];

interface ArtifactStep {
  type: ArtifactType;
  label: string;
  route: string;
  completionKey?: 'bm_completion' | 'uv_completion' | 'pb_completion' | 'ux_completion';
}

const STEPS: ArtifactStep[] = [
  { type: 'business_model', label: 'Business Model', route: '/business-model', completionKey: 'bm_completion' },
  { type: 'validation', label: 'User Validation', route: '/validation', completionKey: 'uv_completion' },
  { type: 'product_brief', label: 'Product Brief', route: '/product-brief', completionKey: 'pb_completion' },
  { type: 'ui_ux', label: 'UI/UX Design', route: '/ui-ux', completionKey: 'ux_completion' },
  { type: 'db_design', label: 'DB Design', route: '/database-design' },
  { type: 'master_prompt', label: 'Master Prompt', route: '/master-prompt' },
];

export function ProgressDashboard() {
  const { artifacts } = useArtifacts();
  const { selectedApp } = useProjectContext();
  const navigate = useNavigate();

  const stepStatuses = useMemo(() => {
    return STEPS.map(step => {
      const artifact = artifacts.find(a => a.type === step.type);
      let completion = 0;

      if (step.completionKey && selectedApp) {
        completion = (selectedApp[step.completionKey] as number) ?? 0;
      } else if (artifact?.status === 'completed') {
        completion = 100;
      } else if (artifact) {
        completion = 50; // has data but not completed
      }

      const isComplete = completion >= 100;
      return { ...step, completion, isComplete, hasData: !!artifact };
    });
  }, [artifacts, selectedApp]);

  const completedCount = stepStatuses.filter(s => s.isComplete).length;
  const overallProgress = Math.round((completedCount / STEPS.length) * 100);

  // Find recommended next step (first incomplete)
  const nextStep = stepStatuses.find(s => !s.isComplete);

  return (
    <Card className="relative overflow-hidden rounded-2xl border-border bg-card p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Project Progress</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {completedCount}/{STEPS.length} artifacts completed
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
        </div>
      </div>

      {/* Overall progress bar */}
      <Progress value={overallProgress} className="h-2 mb-6" />

      {/* Checklist */}
      <div className="space-y-1">
        {stepStatuses.map((step, i) => (
          <button
            key={step.type}
            onClick={() => navigate(step.route)}
            className={cn(
              "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors",
              "hover:bg-secondary/50 group"
            )}
          >
            {step.isComplete ? (
              <CheckCircle2 className="h-5 w-5 text-green-400 shrink-0" />
            ) : (
              <Circle className={cn(
                "h-5 w-5 shrink-0",
                step.hasData ? "text-primary" : "text-muted-foreground/40"
              )} />
            )}
            <span className={cn(
              "flex-1 text-sm font-medium",
              step.isComplete ? "text-muted-foreground line-through" : "text-foreground"
            )}>
              {step.label}
            </span>
            {step.completion > 0 && step.completion < 100 && (
              <span className="text-xs text-muted-foreground">{step.completion}%</span>
            )}
            <ArrowRight className="h-4 w-4 text-muted-foreground/0 group-hover:text-muted-foreground transition-colors shrink-0" />
          </button>
        ))}
      </div>

      {/* Recommended next step */}
      {nextStep && (
        <div className="mt-5 pt-4 border-t border-border">
          <Button
            onClick={() => navigate(nextStep.route)}
            className="w-full gap-2"
            size="sm"
          >
            <Zap className="h-4 w-4" />
            Next: {nextStep.label}
          </Button>
        </div>
      )}

      {completedCount === STEPS.length && (
        <div className="mt-5 pt-4 border-t border-border text-center">
          <p className="text-sm text-green-400 font-medium">🎉 All artifacts complete!</p>
        </div>
      )}
    </Card>
  );
}
