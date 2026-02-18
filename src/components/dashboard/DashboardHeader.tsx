import { useState } from "react";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, ChevronDown, Check, Loader2, MoreHorizontal, Trash2 } from "lucide-react";
import { useProjectContext } from "@/contexts/ProjectContext";
import { LogoUploader } from "./LogoUploader";
import { Tables } from "@/integrations/supabase/types";

type AppIdea = Tables<'app_ideas'>;

export function DashboardHeader() {
  const navigate = useNavigate();
  const { selectedApp, apps, loading, selectApp, clearSelection, deleteApp } = useProjectContext();
  const [appToDelete, setAppToDelete] = useState<AppIdea | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleNewApp = () => {
    clearSelection();
    navigate('/onboarding?mode=new');
  };

  const handleSelectApp = (appId: string) => {
    selectApp(appId);
  };

  const handleDeleteConfirm = async () => {
    if (!appToDelete) return;
    setIsDeleting(true);
    await deleteApp(appToDelete.id);
    setIsDeleting(false);
    setAppToDelete(null);
  };

  return (
    <>
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
              className="w-72 bg-[#1a1f2e] border-slate-700 z-50"
            >
              {apps.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-slate-400">
                  No apps yet. Create your first app!
                </div>
              ) : (
                apps.map((app) => (
                  <div
                    key={app.id}
                    className="flex items-center gap-1 px-1 py-0.5 group rounded-sm hover:bg-slate-800 cursor-pointer"
                    onClick={() => handleSelectApp(app.id)}
                  >
                    {/* App info */}
                    <div className="flex items-start gap-3 p-2 flex-1 min-w-0">
                      <Avatar className="w-8 h-8 rounded-md shrink-0">
                        <AvatarImage src={app.logo || ""} className="rounded-md" />
                        <AvatarFallback className="rounded-md bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs">
                          {app.app_name?.charAt(0).toUpperCase() || "A"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white truncate text-sm">
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
                    </div>

                    {/* Ellipsis menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="p-1.5 rounded hover:bg-slate-700 text-slate-500 hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        side="right"
                        className="w-36 bg-[#1a1f2e] border-slate-700 z-[60]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <DropdownMenuItem
                          className="text-red-400 focus:text-red-400 focus:bg-red-950/40 cursor-pointer flex items-center gap-2"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAppToDelete(app);
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete App
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
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
            className="bg-primary text-white hover:bg-primary/90 rounded-full px-4 h-9 font-medium"
          >
            <Plus className="h-4 w-4 mr-1" />
            New App
          </Button>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!appToDelete} onOpenChange={(open) => !open && setAppToDelete(null)}>
        <AlertDialogContent className="bg-[#1a1f2e] border-slate-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Delete "{appToDelete?.app_name}"?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              This will permanently delete <span className="text-white font-medium">{appToDelete?.app_name}</span> and all its associated data including tasks, artifacts, business models, and database designs. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 hover:text-white">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Delete App
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
