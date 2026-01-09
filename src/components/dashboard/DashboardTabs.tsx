import { cn } from "@/lib/utils";

interface DashboardTabsProps {
  activeTab: string;
  onTabChange?: (tab: string) => void;
}

const tabs = [
  { id: "project-board", label: "Project board" },
  { id: "database-design", label: "Database design" },
  { id: "artifacts", label: "Artifacts" },
  { id: "app-details", label: "App details" },
];

export function DashboardTabs({ activeTab, onTabChange }: DashboardTabsProps) {
  return (
    <div className="flex items-center gap-1 px-6 border-b border-slate-800">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange?.(tab.id)}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px",
            activeTab === tab.id
              ? "text-blue-500 border-blue-500"
              : "text-slate-400 border-transparent hover:text-white"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
