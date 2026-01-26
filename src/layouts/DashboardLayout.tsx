import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { ChatFAB } from "@/components/chat/ChatFAB";
import { ChatProvider } from "@/contexts/ChatContext";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const isProjectBoard = location.pathname === '/project-board';

  return (
    <ChatProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-[#0B0E14]">
          <DashboardSidebar />
          <main className={cn(
            "flex-1 flex flex-col overflow-hidden",
            isProjectBoard 
              ? "bg-gradient-to-br from-[#563b7e] via-[#3a2463] to-[#1d1449]" 
              : "bg-[#0f1219]"
          )}>
            <DashboardHeader />
            <DashboardTabs />
            <div className={cn(
              "flex-1 overflow-auto",
              isProjectBoard ? "p-4" : "p-6"
            )}>
              {children}
            </div>
          </main>
          <ChatFAB />
        </div>
      </SidebarProvider>
    </ChatProvider>
  );
}