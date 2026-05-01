import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useUserFeatures } from '@/hooks/useUserFeatures';
import { useIsAdmin } from '@/hooks/useIsAdmin';

interface AccessGateProps {
  /** Entitlement required to view this route. */
  require: 'build' | 'calendar' | 'programs';
  /** Where to send the user when access is denied. Defaults to /coaching. */
  fallback?: string;
  children: React.ReactNode;
}

/**
 * Navigation-level access gate. If the user lacks the required entitlement
 * (USE layer from `enrollments`), they're redirected to `fallback` instead
 * of seeing a paywall overlay. Admins always pass.
 */
export function AccessGate({ require, fallback = '/coaching', children }: AccessGateProps) {
  const { hasUse, loading } = useUserFeatures();
  const { isAdmin, loading: adminLoading } = useIsAdmin();

  if (loading || adminLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAdmin && !hasUse(require)) {
    return <Navigate to={fallback} replace />;
  }

  return <>{children}</>;
}
