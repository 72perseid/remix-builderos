import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ExternalLink, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export interface LessonCTA {
  id: string;
  cta_type: "external_link" | "upgrade";
  title: string;
  description: string | null;
  cta_label: string | null;
  url: string | null;
  position: number;
}

interface LessonCTACardProps {
  cta: LessonCTA;
  completed: boolean;
  variant?: "default" | "button-only" | "completed";
  onClicked?: () => void;
}

export function LessonCTACard({ cta, completed, variant = "default", onClicked }: LessonCTACardProps) {
  const navigate = useNavigate();
  const [justCompleted, setJustCompleted] = useState(false);

  useEffect(() => {
    if (completed) {
      setJustCompleted(true);
      const t = setTimeout(() => setJustCompleted(false), 1500);
      return () => clearTimeout(t);
    }
  }, [completed]);

  const isUpgrade = cta.cta_type === "upgrade";
  const Icon = isUpgrade ? Sparkles : ExternalLink;
  const label = cta.cta_label || (isUpgrade ? "Learn More" : "Open");

  const handleClick = () => {
    // Fire-and-forget activity log; never block navigation
    (async () => {
      try {
        const { data } = await supabase.auth.getUser();
        const userId = data.user?.id;
        if (!userId) return;
        await supabase.from("activity_log").insert({
          user_id: userId,
          event_type: "cta_clicked",
          entity_type: "cta",
          entity_id: cta.id,
        });
      } catch (err) {
        console.warn("Failed to log cta_clicked", err);
      }
    })();

    if (isUpgrade) {
      if (cta.url) {
        window.open(cta.url, "_blank", "noopener,noreferrer");
      } else {
        navigate("/coaching");
      }
    } else if (cta.url) {
      window.open(cta.url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div
      className={cn(
        "relative rounded-xl border p-4 flex flex-col gap-3 transition-all duration-300",
        isUpgrade
          ? completed
            ? "bg-gradient-to-r from-primary/15 to-primary/5 border-primary/40"
            : "bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20"
          : "bg-card border-border",
        justCompleted && "animate-glow-once"
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            "h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0",
            isUpgrade ? "bg-primary/20 text-primary" : "bg-muted text-foreground"
          )}
        >
          <Icon className="h-4 w-4" />
        </div>

        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-foreground break-words leading-tight">{cta.title}</h3>
          {cta.description && (
            <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{cta.description}</p>
          )}
        </div>
      </div>

      <Button
        size="sm"
        variant={isUpgrade ? "default" : "outline"}
        onClick={handleClick}
        className="w-full gap-1.5"
      >
        {label}
        <ArrowRight className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
