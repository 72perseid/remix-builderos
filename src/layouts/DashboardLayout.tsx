import { SidebarProvider } from "@/components/ui/sidebar";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { ChatFAB } from "@/components/chat/ChatFAB";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-[#0B0E14]">
        <DashboardSidebar />
        <main className="flex-1 bg-[#0f1219] overflow-auto">
          {children}
        </main>
        <ChatFAB />
      </div>
    </SidebarProvider>
  );
}
