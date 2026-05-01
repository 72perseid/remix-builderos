import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useFirstAccessibleRoute } from '@/hooks/useFirstAccessibleRoute';

/**
 * Root redirect: sends authenticated users to their first accessible route
 * (build → /project-board, programs → /programs, calendar → /calendar, else /coaching).
 */
export default function RootRedirect() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { route, loading: accessLoading } = useFirstAccessibleRoute();

  if (authLoading || (isAuthenticated && accessLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={route} replace />;
}
