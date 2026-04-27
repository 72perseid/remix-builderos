import { useNavigate } from 'react-router-dom';
import { Lock, Sparkles, CalendarDays, BookOpen, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export type LockedFeature = 'build' | 'calendar' | 'programs';

interface Copy {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  bullets: string[];
}

const COPY: Record<LockedFeature, Copy> = {
  build: {
    icon: Sparkles,
    title: 'Unlock the Builder Suite',
    description:
      'Get full access to the AI-powered planning and building tools to ship your app faster.',
    bullets: [
      'Project board & task automation',
      'Business model, validation & product brief artifacts',
      'Database design & master prompt generator',
    ],
  },
  calendar: {
    icon: CalendarDays,
    title: 'Unlock the Expert Calendar',
    description:
      'See live sessions and book time directly with our experts to accelerate your build.',
    bullets: [
      'Live group sessions with experts',
      '1:1 booking with founders & coaches',
      'Synced reminders to your calendar',
    ],
  },
  programs: {
    icon: BookOpen,
    title: 'Unlock our Programs',
    description:
      'Access the DIA Vibe Coding MBA and our full library of premium courses.',
    bullets: [
      'DIA Vibe Coding MBA',
      'Step-by-step launch playbooks',
      'Premium templates and resources',
    ],
  },
};

/**
 * Shared centered "talk to an expert" upgrade card.
 * Pair with a wrapper applying `blur-md select-none pointer-events-none`
 * to the underlying content. Mirrors the ProjectBoardPage pattern.
 */
export function LockedOverlay({ feature }: { feature: LockedFeature }) {
  const navigate = useNavigate();
  const copy = COPY[feature];
  const Icon = copy.icon;

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 p-6">
      <div className="bg-card/95 backdrop-blur border border-border rounded-2xl p-6 max-w-md w-full shadow-2xl">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
          <div className="relative">
            <Icon className="h-7 w-7 text-primary" />
            <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-primary bg-background rounded-full p-0.5" />
          </div>
        </div>
        <h2 className="text-center text-xl font-semibold text-foreground mb-1.5">{copy.title}</h2>
        <p className="text-center text-sm text-muted-foreground mb-4">{copy.description}</p>
        <ul className="space-y-2.5 mb-5">
          {copy.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>
        <Button onClick={() => navigate('/coaching')} className="w-full">
          Talk to an Expert
        </Button>
      </div>
    </div>
  );
}
