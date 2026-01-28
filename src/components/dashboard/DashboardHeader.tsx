import { useNavigate } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Plus, ChevronDown, Check, Loader2 } from "lucide-react";
import { useProjectContext } from "@/contexts/ProjectContext";
import { LogoUploader } from "./LogoUploader";

export function DashboardHeader() {
  const navigate = useNavigate();
  const { selectedApp, apps, loading, selectApp, clearSelection } = useProjectContext();

  const handleNewApp = () => {
    clearSelection();
    navigate('/onboarding?mode=new');
  };

  const handleSelectApp = (appId: string) => {
    selectApp(appId);
  };

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
      <div className="flex items-center gap-4">
        {selectedApp ? (
          <LogoUploader
            appId={selectedApp.id}
            appName={selectedApp.app_name || "App"}
            currentLogo={selectedApp.logo}
            size="md"
          />
        ) : (
          <Avatar className="w-10 h-10 rounded-lg">
            <AvatarFallback className="rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold text-lg">
              A
            </AvatarFallback>
          </Avatar>
        )}
        <div>
          <h2 className="text-xl font-bold text-white">
            {selectedApp?.app_name || "My App"}
          </h2>
          <p className="text-sm text-slate-400">
            {selectedApp?.one_liner || selectedApp?.app_description?.substring(0, 60) || "Your app description"}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {/* App Selector Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="outline" 
              className="border-slate-700 bg-slate-800/50 text-white hover:bg-slate-700 hover:text-white"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {selectedApp?.app_name || "Select App"}
              <ChevronDown className="h-4 w-4 ml-2" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-72 bg-[#1a1f2e] border-slate-700"
          >
            {apps.length === 0 ? (
              <div className="px-3 py-4 text-center text-sm text-slate-400">
                No apps yet. Create your first app!
              </div>
            ) : (
              apps.map((app) => (
                <DropdownMenuItem
                  key={app.id}
                  onClick={() => handleSelectApp(app.id)}
                  className="flex items-start gap-3 p-3 cursor-pointer focus:bg-slate-800 focus:text-white"
                >
                  <Avatar className="w-8 h-8 rounded-md shrink-0">
                    <AvatarImage src={app.logo || ""} className="rounded-md" />
                    <AvatarFallback className="rounded-md bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                      {app.app_name?.charAt(0).toUpperCase() || "A"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white truncate">
                        {app.app_name || "Untitled App"}
                      </span>
                      {app.id === selectedApp?.id && (
                        <Check className="h-4 w-4 text-blue-400 shrink-0" />
                      )}
                    </div>
                    {app.one_liner && (
                      <p className="text-xs text-slate-400 truncate mt-0.5">
                        {app.one_liner}
                      </p>
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            )}
            <DropdownMenuSeparator className="bg-slate-700" />
            <DropdownMenuItem
              onClick={handleNewApp}
              className="flex items-center gap-2 p-3 cursor-pointer focus:bg-slate-800 focus:text-white text-blue-400"
            >
              <Plus className="h-4 w-4" />
              <span>Create New App</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* New App Button */}
        <Button 
          onClick={handleNewApp}
          className="bg-white text-black hover:bg-slate-200 rounded-full px-4 h-9 font-medium"
        >
          <Plus className="h-4 w-4 mr-1" />
          New App
        </Button>
      </div>
    </div>
  );
}
