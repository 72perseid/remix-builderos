import { useLocation, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "project-board", label: "Project board", route: "/ai-kanban-assistant" },
  { id: "database-design", label: "Database design", route: "/database-design" },
  { id: "artifacts", label: "Artifacts", route: "/dashboard" },
  { id: "app-details", label: "App details", route: "/business-model" },
];

const routeToTab: Record<string, string> = {
  '/dashboard': 'artifacts',
  '/ai-kanban-assistant': 'project-board',
  '/database-design': 'database-design',
  '/business-model': 'app-details',
  '/product-brief': 'app-details',
  '/validation': 'app-details',
  '/app-idea': 'app-details',
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
    <div className="flex items-center gap-1 px-6 border-b border-slate-800">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleTabChange(tab.id)}
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
