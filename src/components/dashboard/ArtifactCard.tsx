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
  loading: <Loader2 className="h-4 w-4 animate-spin text-blue-500" />,
  locked: <Lock className="h-4 w-4 text-slate-600" />,
  completed: <User className="h-4 w-4 text-blue-500" />,
  available: <ChevronRight className="h-4 w-4 text-slate-500" />,
};

export function ArtifactCard({ title, description, status, onClick }: ArtifactCardProps) {
  const isClickable = status === "available" || status === "completed";

  return (
    <div
      onClick={isClickable ? onClick : undefined}
      className={cn(
        "relative flex flex-col min-h-[220px] p-4 rounded-xl border transition-all duration-200",
        "bg-[#151b2b] border-slate-800",
        isClickable && "cursor-pointer hover:border-slate-700",
        !isClickable && "opacity-90"
      )}
    >
      <h3 className="text-white text-lg font-medium mb-2">{title}</h3>
      <p className="text-slate-400 text-sm line-clamp-3 flex-1">{description}</p>
      <div className="absolute bottom-4 right-4">
        {statusIcons[status]}
      </div>
    </div>
  );
}
