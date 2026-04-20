import { useLocation, Link } from 'react-router-dom';
import { X } from 'lucide-react';
import { useDebugMode } from '@/hooks/useDebugMode';
import { useIsAdmin } from '@/hooks/useIsAdmin';

const routes = [
  { path: '/onboarding', label: 'Onboarding' },
  { path: '/artifacts', label: 'Artifacts' },
  { path: '/project-board', label: 'Project Board' },
  { path: '/app-idea', label: 'App Idea' },
  { path: '/business-model', label: 'Business Model' },
  { path: '/database-design', label: 'Database Design' },
  { path: '/validation', label: 'Validation' },
  { path: '/product-brief', label: 'Product Brief' },
  { path: '/ui-ux', label: 'UI/UX' },
  { path: '/master-prompt', label: 'Master Prompt' },
  { path: '/app-details', label: 'App Details' },
  { path: '/coaching', label: 'Coaching' },
  { path: '/login', label: 'Login' },
];

export function DebugNav() {
  const { isDebug, toggle } = useDebugMode();
  const { isAdmin } = useIsAdmin();
  const location = useLocation();

  if (!isAdmin || !isDebug) return null;

  return (
    <div className="fixed top-0 left-0 z-[100] h-full w-52 bg-black/90 backdrop-blur-sm border-r border-white/10 p-3 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">Debug Nav</span>
        <button onClick={toggle} className="text-white/50 hover:text-white">
          <X className="h-4 w-4" />
        </button>
      </div>
      <nav className="flex flex-col gap-0.5">
        {routes.map(r => (
          <Link
            key={r.path}
            to={r.path}
            className={`text-xs font-mono px-2 py-1.5 rounded transition-colors ${
              location.pathname === r.path
                ? 'bg-amber-500/20 text-amber-300'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            {r.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
