import { useNavigate } from "react-router-dom";
import { Lock, Sparkles, CalendarDays, BookOpen, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type PaywallFeature = "build" | "calendar" | "programs";

interface PaywallCopy {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  bullets: string[];
}

const PAYWALL_COPY: Record<PaywallFeature, PaywallCopy> = {
  build: {
    icon: Sparkles,
    title: "Unlock the Builder Suite",
    description:
      "Get full access to the AI-powered planning and building tools to ship your app faster.",
    bullets: [
      "Project board & task automation",
      "Business model, validation & product brief artifacts",
      "Database design & master prompt generator",
    ],
  },
  calendar: {
    icon: CalendarDays,
    title: "Unlock the Expert Calendar",
    description:
      "See live sessions and book time directly with our experts to accelerate your build.",
    bullets: [
      "Live group sessions with experts",
      "1:1 booking with founders & coaches",
      "Synced reminders to your calendar",
    ],
  },
  programs: {
    icon: BookOpen,
    title: "Unlock our Flagship Programs",
    description:
      "Access the DIA Vibe Coding MBA and our full library of premium courses.",
    bullets: [
      "DIA Vibe Coding MBA",
      "Step-by-step launch playbooks",
      "Premium templates and resources",
    ],
  },
};

interface PaywallDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feature: PaywallFeature | null;
  onUpgrade?: () => void;
}

export function PaywallDialog({
  open,
  onOpenChange,
  feature,
  onUpgrade,
}: PaywallDialogProps) {
  const navigate = useNavigate();
  if (!feature) return null;

  const copy = PAYWALL_COPY[feature];
  const Icon = copy.icon;

  const handleUpgrade = () => {
    onOpenChange(false);
    if (onUpgrade) onUpgrade();
    else navigate("/coaching");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 border border-primary/20">
            <div className="relative">
              <Icon className="h-7 w-7 text-primary" />
              <Lock className="absolute -bottom-1 -right-1 h-4 w-4 text-primary bg-background rounded-full p-0.5" />
            </div>
          </div>
          <DialogTitle className="text-center text-xl">{copy.title}</DialogTitle>
          <DialogDescription className="text-center">
            {copy.description}
          </DialogDescription>
        </DialogHeader>

        <ul className="space-y-2.5 py-2">
          {copy.bullets.map((b) => (
            <li key={b} className="flex items-start gap-2.5 text-sm text-foreground">
              <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
              <span>{b}</span>
            </li>
          ))}
        </ul>

        <DialogFooter className="flex-col-reverse sm:flex-row gap-2">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="sm:flex-1"
          >
            Maybe later
          </Button>
          <Button onClick={handleUpgrade} className="sm:flex-1">
            Talk to an Expert
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
