import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

interface DashboardHeaderProps {
  appName?: string;
  appOneLiner?: string;
}

export function DashboardHeader({ 
  appName, 
  appOneLiner 
}: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
          <span className="text-white font-bold text-lg">A</span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{appName}</h2>
          <p className="text-sm text-slate-400">{appOneLiner}</p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex -space-x-2">
          {[1, 2, 3].map((i) => (
            <Avatar key={i} className="h-8 w-8 border-2 border-[#0F172A]">
              <AvatarImage src="" />
              <AvatarFallback className="bg-slate-700 text-slate-300 text-xs">
                U{i}
              </AvatarFallback>
            </Avatar>
          ))}
        </div>
        <Button 
          className="bg-white text-black hover:bg-slate-200 rounded-full px-4 h-9 font-medium"
        >
          <Plus className="h-4 w-4 mr-1" />
          Invite
        </Button>
      </div>
    </div>
  );
}
