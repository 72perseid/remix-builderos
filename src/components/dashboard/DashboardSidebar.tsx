import { useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { LayoutDashboard, PanelLeftClose, PanelLeft, Sparkles, Users, CalendarDays, BookOpen, Shield } from "lucide-react";
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";
import { useEnrollment } from "@/hooks/useEnrollment";
import { useIsAdmin } from "@/hooks/useIsAdmin";
import { usePaywall } from "@/hooks/usePaywall";
import { PaywallDialog, type PaywallFeature } from "@/components/paywall/PaywallDialog";
import { ProfileSheet } from "./ProfileSheet";

import logoHorizontalMono from "@/assets/logo-horizontal-mono.png";

interface NavItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  routes: string[];
  accessKey?: 'build' | 'calendar' | 'programs';
}

const mainNavItems: NavItem[] = [{
  title: "Build",
  url: "/project-board",
  icon: LayoutDashboard,
  routes: ['/project-board', '/artifacts', '/database-design', '/master-prompt', '/app-details', '/app-idea', '/business-model', '/validation', '/product-brief', '/ui-ux'],
  accessKey: 'build',
}, {
  title: "Programs",
  url: "/programs",
  icon: BookOpen,
  routes: ['/programs'],
  accessKey: 'programs',
}, {
  title: "Calendar",
  url: "/calendar",
  icon: CalendarDays,
  routes: ['/calendar'],
  accessKey: 'calendar',
}, {
  title: "Expert Support",
  url: "/coaching",
  icon: Sparkles,
  routes: ['/coaching'],
}, {
  title: "1‑on‑1 Coaching",
  url: "/1on1-coaching",
  icon: Users,
  routes: ['/1on1-coaching'],
}];

export function DashboardSidebar() {
  const location = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const { user } = useAuth();
  const { profile } = useProfile();
  const { buildAccess, calendarAccess, programsAccess } = useEnrollment();
  const { isAdmin } = useIsAdmin();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const isCollapsed = state === "collapsed";

  const paywall = usePaywall();

  const accessMap: Record<string, boolean> = {
    build: buildAccess,
    calendar: calendarAccess,
    programs: programsAccess,
  };

  const visibleItems = [
    ...mainNavItems,
    ...(isAdmin ? [{ title: "Admin", url: "/admin", icon: Shield, routes: ['/admin'] } as NavItem] : []),
  ];

  const isActive = (item: NavItem) => item.routes.includes(location.pathname);

  const isLocked = (item: NavItem) =>
    !!item.accessKey && !isAdmin && !accessMap[item.accessKey];

  return (
    <Sidebar className="border-r border-sidebar-border bg-[#0B0E14]" collapsible="icon">
      {/* Logo */}
      <SidebarHeader className={isCollapsed ? "px-2 pt-3 pb-2 bg-[#0B0E14]" : "px-5 pt-5 pb-4 bg-[#0B0E14]"}>
        <div className={isCollapsed ? "flex flex-col items-center gap-2" : "flex items-center justify-between"}>
          <Link to="/artifacts" className="flex items-center">
            {!isCollapsed && <img src={logoHorizontalMono} alt="Ambitious Labs" className="h-8" />}
            {isCollapsed && <span className="text-lg font-bold text-white">A</span>}
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-7 w-7 text-slate-400 hover:text-white hover:bg-white/10"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
          </Button>
        </div>
      </SidebarHeader>

      {/* Nav items */}
      <SidebarContent className={isCollapsed ? "bg-[#0B0E14] px-1" : "bg-[#0B0E14] px-3"}>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {visibleItems.map(item => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item)}
                    className="rounded-full h-10 px-4 transition-all duration-200 text-slate-400 hover:text-white hover:bg-white/5 data-[active=true]:!bg-[hsl(217,91%,25%)] data-[active=true]:!text-blue-300 data-[active=true]:font-medium"
                  >
                    <Link to={item.url}>
                      <item.icon className="h-5 w-5" />
                      <span className="text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User profile footer */}
      <SidebarFooter className={isCollapsed ? "border-t border-sidebar-border p-2 bg-[#0B0E14]" : "border-t border-sidebar-border p-4 bg-[#0B0E14]"}>
        <div className={isCollapsed ? "flex flex-col items-center gap-2" : "flex items-center justify-between gap-3"}>
          <div
            className={isCollapsed ? "cursor-pointer hover:opacity-80 transition-opacity" : "flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"}
            onClick={() => setIsProfileOpen(true)}
          >
            <Avatar className={isCollapsed ? "h-8 w-8 border-2 border-slate-700" : "h-9 w-9 border-2 border-slate-700"}>
              <AvatarImage src={profile?.profile_image || ""} />
              <AvatarFallback className="bg-primary/30 text-primary text-sm">
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
        </div>
      </SidebarFooter>

      <ProfileSheet open={isProfileOpen} onOpenChange={setIsProfileOpen} />
    </Sidebar>
  );
}
