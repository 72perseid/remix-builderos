import { Lock, Loader2, CheckCircle2, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ArtifactStatus = "loading" | "locked" | "completed" | "available";

interface ArtifactCardProps {
  title: string;
  description: string;
  status: ArtifactStatus;
  onClick?: () => void;
}

const statusConfig = {
  loading: {
    icon: <Loader2 className="h-4 w-4 animate-spin text-blue-400" />,
    label: "Generating...",
  },
  locked: {
    icon: <Lock className="h-4 w-4 text-slate-500" />,
    label: "Waiting for data",
  },
  completed: {
    icon: <CheckCircle2 className="h-4 w-4 text-green-400" />,
    label: "Ready",
  },
  available: {
    icon: <ChevronRight className="h-4 w-4 text-slate-400" />,
    label: "Available",
  },
};

export function ArtifactCard({ title, description, status, onClick }: ArtifactCardProps) {
  const isClickable = status === "available" || status === "completed";
  const config = statusConfig[status];

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "relative flex flex-col min-h-[200px] p-4 rounded-xl border transition-all duration-200",
        "bg-[#151b2b] border-slate-800",
        isClickable && "cursor-pointer hover:border-slate-600 hover:bg-slate-800/50",
        status === "locked" && "opacity-60",
        status === "loading" && "animate-pulse"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        {config.icon}
        <span className={cn(
          "text-xs",
          status === "locked" && "text-slate-500",
          status === "loading" && "text-blue-400",
          status === "completed" && "text-green-400",
          status === "available" && "text-slate-400"
        )}>
          {config.label}
        </span>
      </div>
      <h3 className={cn(
        "text-lg font-medium mb-2",
        status === "locked" ? "text-slate-400" : "text-white"
      )}>
        {title}
      </h3>
      <p className={cn(
        "text-sm line-clamp-3 flex-1",
        status === "locked" ? "text-slate-500" : "text-slate-400"
      )}>
        {description}
      </p>
    </div>
  );
}
