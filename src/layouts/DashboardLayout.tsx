import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { ChatFAB } from "@/components/chat/ChatFAB";
import { ChatProvider } from "@/contexts/ChatContext";
import { useProfile } from "@/hooks/useProfile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { appIdeas } = useProfile();
  const currentApp = appIdeas?.[0]; // Get the first/current app

  return (
    <ChatProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-[#0B0E14]">
          <DashboardSidebar />
          <main className="flex-1 flex flex-col bg-[#0f1219] overflow-hidden">
            <DashboardHeader 
              appName={currentApp?.app_name || "My App"} 
              appOneLiner={currentApp?.one_liner || currentApp?.app_description?.substring(0, 60) || "Your app description"} 
            />
            <DashboardTabs />
            <div className="flex-1 overflow-auto p-6">
              {children}
            </div>
          </main>
          <ChatFAB />
        </div>
      </SidebarProvider>
    </ChatProvider>
  );
}
