import { useState } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { LayoutDashboard, ChevronLeft, ChevronRight, LogOut } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { ProfileSheet } from "./ProfileSheet";
import { toast } from "sonner";
import logoHorizontalMono from "@/assets/logo-horizontal-mono.png";

const mainNavItems = [{
  title: "Dashboard",
  url: "/dashboard",
  icon: LayoutDashboard
}];
export function DashboardSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { state } = useSidebar();
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isCollapsed = state === "collapsed";

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error("Failed to sign out");
    } else {
      toast.success("Signed out successfully");
      navigate("/auth");
    }
  };
  const isActive = (path: string) => location.pathname === path;
  return <Sidebar className="border-r border-slate-800/50 bg-[#0B0E14] w-[240px]" collapsible="icon">
      <SidebarHeader className="p-4 border-b border-slate-800 bg-[#0e172a] text-secondary">
        <div className="flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center">
            {!isCollapsed && <img src={logoHorizontalMono} alt="Ambitious Labs" className="h-8" />}
            {isCollapsed && <span className="text-lg font-bold text-white">A</span>}
          </Link>
          <SidebarTrigger className="text-slate-400 hover:text-white">
            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </SidebarTrigger>
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-[#0B0E14]">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
            {mainNavItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={isActive(item.url)} className={`
                      transition-all duration-200
                      ${isActive(item.url) ? "bg-[#0b0e15] text-primary border-l-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-[#0b0e15]"}
                    `}>
                    <Link to={item.url}>
                      <item.icon className={`h-5 w-5 ${isActive(item.url) ? "text-primary" : "text-muted-foreground"}`} />
                      <span className="text-base">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-slate-800 p-4 bg-[#0B0E14]">
        <div className="flex items-center justify-between gap-3">
          <div 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsProfileOpen(true)}
          >
            <Avatar className="h-10 w-10 border-2 border-slate-700">
              <AvatarImage src={profile?.profile_image || ""} />
              <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                {profile?.first_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
              <div className="flex flex-col">
                <span className="text-sm font-medium text-white">
                  {profile?.first_name || user?.user_metadata?.first_name || "User"} {profile?.last_name || user?.user_metadata?.last_name || ""}
                </span>
                <span className="text-xs text-slate-400">DIA Accelerator</span>
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleSignOut}
            className="text-slate-400 hover:text-white hover:bg-slate-800/50"
            title="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>

      <ProfileSheet open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </Sidebar>;
}