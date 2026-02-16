import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ArtifactBackButton() {
  const navigate = useNavigate();

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => navigate("/artifacts")}
      className="text-slate-400 hover:text-white hover:bg-slate-800/50 mb-4"
    >
      <ArrowLeft className="h-4 w-4 mr-2" />
      Back to Artifacts
    </Button>
  );
}
