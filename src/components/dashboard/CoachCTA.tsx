import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CoachCTAProps {
  message: string;
  ctaLabel?: string;
}

export function CoachCTA({ message, ctaLabel = 'Talk to an Expert' }: CoachCTAProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between gap-4 px-5 py-4 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm">
      <p className="text-sm text-muted-foreground">{message}</p>
      <button
        onClick={() => navigate('/coaching')}
        className="shrink-0 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
      >
        {ctaLabel}
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
