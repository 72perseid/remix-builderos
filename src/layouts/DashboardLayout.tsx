import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";

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
          <main className="flex-1 flex flex-col bg-[#0f1219] overflow-hidden">
            <div className="overflow-y-auto flex-1 flex flex-col">
              <DashboardHeader />
              <DashboardTabs />
              <div className="flex-1">
                {children}
              </div>
            </div>
          </main>
          
        </div>
      </SidebarProvider>
    </ChatProvider>
  );
}