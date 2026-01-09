import { Lock, Loader2, User, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type ArtifactStatus = "loading" | "locked" | "completed" | "available";

interface ArtifactCardProps {
  title: string;
  description: string;
  status: ArtifactStatus;
  onClick?: () => void;
}

const statusIcons = {
  loading: <Loader2 className="h-5 w-5 animate-spin text-blue-500" />,
  locked: <Lock className="h-5 w-5 text-slate-500" />,
  completed: <User className="h-5 w-5 text-blue-500" />,
  available: <ChevronRight className="h-5 w-5 text-slate-400" />,
};

export function ArtifactCard({ title, description, status, onClick }: ArtifactCardProps) {
  const isClickable = status === "available" || status === "completed";

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "relative p-5 rounded-xl border transition-all duration-200",
        "bg-slate-800/50 border-slate-700/50",
        isClickable && "cursor-pointer hover:bg-slate-800 hover:border-slate-600",
        !isClickable && "opacity-80"
      )}
    >
      <div className="pr-8">
        <h3 className="text-white font-medium mb-2">{title}</h3>
        <p className="text-slate-400 text-sm line-clamp-2">{description}</p>
      </div>
      <div className="absolute bottom-5 right-5">
        {statusIcons[status]}
      </div>
    </div>
  );
}
