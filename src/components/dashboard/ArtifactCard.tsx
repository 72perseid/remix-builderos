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
        "group relative overflow-hidden border-0 bg-transparent",
        isClickable && "cursor-pointer",
        status === "locked" && "opacity-60",
        status === "loading" && "animate-pulse",
        className
      )}
    >
      {/* Background layers */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1a2235] via-[#161e2a] to-[#0f1729]" />
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-[#1a2235] via-[#161e2a] to-[#0f1729]" />
      
      {/* Animated border gradient on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/50 via-blue-500/50 to-primary/50 blur-sm" />
        <div className="absolute inset-[1px] rounded-2xl bg-gradient-to-br from-[#1a2235] via-[#161e2a] to-[#0f1729]" />
      </div>


      {/* Content */}
      <div className="relative p-5 pt-10 min-h-[180px] flex flex-col">
        {/* Icon with glow effect */}
        <div className="mb-3">
          <div className="relative inline-flex">
            <div className={cn(
              "absolute inset-0 rounded-xl blur-xl transition-colors duration-300",
              status === "completed" ? "bg-green-500/20 group-hover:bg-green-500/30" : "bg-primary/20 group-hover:bg-primary/30"
            )} />
            <div className={cn(
              "relative flex items-center justify-center w-12 h-12 rounded-xl border transition-colors duration-300",
              status === "completed" 
                ? "bg-gradient-to-br from-green-500/20 to-green-500/5 border-green-500/20 group-hover:border-green-500/40"
                : "bg-gradient-to-br from-primary/20 to-primary/5 border-primary/20 group-hover:border-primary/40"
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
          status === "locked" ? "text-slate-500" : "text-muted-foreground"
        )}>
          {description}
        </p>

        {/* Decorative lines */}
        <div className="absolute bottom-3 right-3 flex gap-1">
          <div className={cn(
            "w-6 h-0.5 rounded-full transition-colors duration-300",
            status === "completed" ? "bg-green-500/30 group-hover:bg-green-500/50" : "bg-primary/20 group-hover:bg-primary/40"
          )} />
          <div className={cn(
            "w-3 h-0.5 rounded-full transition-colors duration-300",
            status === "completed" ? "bg-green-500/20 group-hover:bg-green-500/40" : "bg-primary/10 group-hover:bg-primary/30"
          )} />
          <div className={cn(
            "w-1.5 h-0.5 rounded-full transition-colors duration-300",
            status === "completed" ? "bg-green-500/10 group-hover:bg-green-500/30" : "bg-primary/5 group-hover:bg-primary/20"
          )} />
        </div>
      </div>

      {/* Shine effect on hover */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
      </div>
    </Card>
  );
}
