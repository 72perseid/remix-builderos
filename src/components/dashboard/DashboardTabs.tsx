import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "project-board", label: "Project Board", route: "/project-board" },
  { id: "artifacts", label: "Artifacts", route: "/dashboard" },
  { id: "database-design", label: "Database Design", route: "/database-design" },
  { id: "master-prompt", label: "Master Prompt", route: "/master-prompt" },
  { id: "app-details", label: "App Details", route: "/app-details" },
];

const routeToTab: Record<string, string> = {
  '/dashboard': 'artifacts',
  '/project-board': 'project-board',
  '/database-design': 'database-design',
  '/master-prompt': 'master-prompt',
  '/app-details': 'app-details',
  '/business-model': 'artifacts',
  '/product-brief': 'artifacts',
  '/validation': 'artifacts',
  '/app-idea': 'artifacts',
};

export function DashboardTabs() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const activeTab = routeToTab[location.pathname] || 'artifacts';

  const handleTabChange = (tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    if (tab) {
      navigate(tab.route);
    }
  };

  return (
    <div className="flex items-center gap-1 px-6 border-b border-slate-800 overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
          className={cn(
            "px-4 py-3 text-sm font-medium transition-all duration-200 border-b-2 -mb-px whitespace-nowrap",
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
