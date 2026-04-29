import { Lock, Loader2, CheckCircle2, Briefcase, Users, FileText, Database, Kanban, FileCode, Sparkles, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ReactNode } from "react";

export type ArtifactStatus = "loading" | "locked" | "completed" | "available" | "ready";

interface ArtifactCardProps {
  title: string;
  description: string;
  status: ArtifactStatus;
  completion?: number | null;
  onClick?: () => void;
  className?: string;
  /**
   * When true, the card is rendered as locked-behind-paywall: shows an
   * "Upgrade" pill, replaces the status badge with an upgrade prompt,
   * hides the completion bar. The click handler still fires (route it
   * to /coaching).
   */
  upgradeRequired?: boolean;
}

const statusConfig = {
  loading: {
    icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />,
    label: "Generating...",
    color: "text-blue-400",
  },
  locked: {
    icon: <Lock className="h-3.5 w-3.5" />,
    label: "Waiting for data",
    color: "text-slate-500",
  },
  completed: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Ready",
    color: "text-green-400",
  },
  available: {
    icon: <CheckCircle2 className="h-3.5 w-3.5" />,
    label: "Available",
    color: "text-primary",
  },
  ready: {
    icon: <Sparkles className="h-3.5 w-3.5" />,
    label: "Ready to Generate",
    color: "text-green-400",
  },
};

// Get icon based on card title
const getCardIcon = (title: string): ReactNode => {
  const iconClass = "w-7 h-7 text-white";
  
  switch (title.toLowerCase()) {
    case 'business model':
      return <Briefcase className={iconClass} />;
    case 'validation strategy':
      return <Users className={iconClass} />;
    case 'product brief':
      return <FileText className={iconClass} />;
    case 'database design':
      return <Database className={iconClass} />;
    case 'roadmap & features':
      return <Kanban className={iconClass} />;
    case 'master prompt / prd':
      return <FileCode className={iconClass} />;
    case 'landing copy':
      return <Type className={iconClass} />;
    default:
      return <FileText className={iconClass} />;
  }
};

export function ArtifactCard({ title, description, status, completion, onClick, className, upgradeRequired }: ArtifactCardProps) {
  const isClickable = upgradeRequired || status === "available" || status === "completed" || status === "ready" || status === "locked";
  const config = statusConfig[status];

  return (
    <Card
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-card border border-slate-700/50",
        isClickable && "cursor-pointer hover:border-slate-600/70",
        (status === "locked" || upgradeRequired) && "opacity-70",
        status === "loading" && !upgradeRequired && "animate-pulse",
        className
      )}
    >
      {/* Upgrade pill */}
      {upgradeRequired && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 bg-primary/15 text-primary text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-primary/30">
          <Lock className="h-3 w-3" />
          Upgrade
        </div>
      )}

      {/* Content */}
      <div className="relative p-5 pt-10 min-h-[180px] flex flex-col">
        {/* Icon with glow effect */}
        <div className="mb-3">
          <div className="relative inline-flex">
            <div className={cn(
              "relative flex items-center justify-center w-12 h-12 rounded-xl border transition-colors duration-300",
              upgradeRequired
                ? "bg-muted/40 border-border"
                : status === "completed" 
                  ? "bg-green-500/10 border-green-500/20 group-hover:border-green-500/40"
                  : "bg-primary/10 border-primary/20 group-hover:border-primary/40"
            )}>
              {getCardIcon(title)}
            </div>
          </div>
        </div>

        {/* Status badge */}
        {upgradeRequired ? (
          <div className="flex items-center gap-1.5 mb-2 text-primary">
            <Lock className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Upgrade required</span>
          </div>
        ) : (
          <div className={cn("flex items-center gap-1.5 mb-2", config.color)}>
            {config.icon}
            <span className="text-xs font-medium">{config.label}</span>
          </div>
        )}

        {/* Title */}
        <h3 className={cn(
          "text-base font-semibold mb-1.5 transition-colors duration-300",
          status === "locked" || upgradeRequired ? "text-slate-300" : "text-white group-hover:text-primary"
        )}>
          {title}
        </h3>

        {/* Description */}
        <p className={cn(
          "text-sm leading-relaxed flex-1",
          status === "locked" || upgradeRequired ? "text-slate-500" : "text-secondary-foreground"
        )}>
          {description}
        </p>

        {/* Progress indicator */}
        {!upgradeRequired && completion != null && (
          <div className="mt-3 space-y-1.5">
            <Progress value={completion} className="h-1.5" />
            <p className="text-xs text-muted-foreground">
              {completion >= 100
                ? "✓ Complete — output generated"
                : `${completion}% · Keep refining`}
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
