import { useState } from "react";
import { DashboardLayout } from "@/layouts/DashboardLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { DashboardTabs } from "@/components/dashboard/DashboardTabs";
import { ArtifactsGrid } from "@/components/dashboard/ArtifactsGrid";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("artifacts");

  return (
    <DashboardLayout>
      <div className="flex flex-col h-screen">
        <DashboardHeader 
          appName="My App" 
          appOneLiner="Building the future of productivity" 
        />
        <DashboardTabs activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 overflow-auto p-6">
          {activeTab === "artifacts" && <ArtifactsGrid />}
          {activeTab === "project-board" && (
            <div className="text-slate-400">Project board content coming soon...</div>
          )}
          {activeTab === "database-design" && (
            <div className="text-slate-400">Database design content coming soon...</div>
          )}
          {activeTab === "app-details" && (
            <div className="text-slate-400">App details content coming soon...</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
