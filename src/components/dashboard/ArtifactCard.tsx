import { Lock, Loader2, CheckCircle2, Briefcase, Users, FileText, Database, Kanban, FileCode, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

export type ArtifactStatus = "loading" | "locked" | "completed" | "available" | "ready";

interface ArtifactCardProps {
  title: string;
  description: string;
  status: ArtifactStatus;
  onClick?: () => void;
  className?: string;
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
    default:
      return <FileText className={iconClass} />;
  }
};

export function ArtifactCard({ title, description, status, onClick, className }: ArtifactCardProps) {
  const isClickable = status === "available" || status === "completed" || status === "ready";
  const config = statusConfig[status];

  return (
    <Card
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-[#161e2a] border border-slate-700/50",
        isClickable && "cursor-pointer hover:border-slate-600/70",
        status === "locked" && "opacity-60",
        status === "loading" && "animate-pulse",
        className
      )}
    >
      {/* Content */}
      <div className="relative p-5 pt-10 min-h-[180px] flex flex-col">
        {/* Icon with glow effect */}
        <div className="mb-3">
          <div className="relative inline-flex">
            <div className={cn(
              "relative flex items-center justify-center w-12 h-12 rounded-xl border transition-colors duration-300",
              status === "completed" 
                ? "bg-green-500/10 border-green-500/20 group-hover:border-green-500/40"
                : "bg-primary/10 border-primary/20 group-hover:border-primary/40"
            )}>
              {getCardIcon(title)}
            </div>
          </div>
        </div>

        {/* Status badge */}
        <div className={cn("flex items-center gap-1.5 mb-2", config.color)}>
          {config.icon}
          <span className="text-xs font-medium">{config.label}</span>
        </div>

        {/* Title */}
        <h3 className={cn(
          "text-base font-semibold mb-1.5 transition-colors duration-300",
          status === "locked" ? "text-slate-400" : "text-white group-hover:text-primary"
        )}>
          {title}
        </h3>

        {/* Description */}
        <p className={cn(
          "text-sm leading-relaxed flex-1",
          status === "locked" ? "text-slate-500" : "text-secondary-foreground"
        )}>
          {description}
        </p>
      </div>
    </Card>
  );
}
