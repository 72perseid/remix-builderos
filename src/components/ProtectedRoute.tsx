import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const mode = searchParams.get('mode');
  const { isAdmin } = useIsAdmin();
  const isDebugMode = isAdmin && (searchParams.get('debug') === 'true' || sessionStorage.getItem('debug_mode') === 'true');
  const isAllowedMode = mode === 'new' || mode === 'setup' || isDebugMode;

  // Check if user has completed onboarding
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile-onboarding', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      return data;
    },
    enabled: !!user?.id,
  });

  // Check if user has any existing apps (indicates returning user)
  const { data: hasExistingApps, isLoading: appsLoading } = useQuery({
    queryKey: ['user-has-apps', user?.id],
    queryFn: async () => {
      if (!user?.id) return false;
      const { count, error } = await supabase
        .from('app_ideas')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id);
      
      if (error) return false;
      return (count ?? 0) > 0;
    },
    enabled: !!user?.id,
  });

  if (loading || profileLoading || appsLoading || enrollmentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Admins bypass onboarding entirely and land on /admin by default
  const isOnOnboardingPage = location.pathname === '/onboarding';
  const hasSkippedOnboarding = sessionStorage.getItem('onboarding_skipped') === 'true';

  if (isAdmin) {
    if (isOnOnboardingPage && !isAllowedMode) {
      return <Navigate to="/admin" replace />;
    }
  } else {
    if (profile && profile.onboarded === false && !isOnOnboardingPage && !hasSkippedOnboarding && !hasExistingApps) {
      return <Navigate to="/onboarding" replace />;
    }

    if (profile && profile.onboarded === true && isOnOnboardingPage && !isAllowedMode) {
      return <Navigate to="/project-board" replace />;
    }
  }

  // Enrollment-based route gating
  const path = location.pathname;

  // Determine the first accessible route for redirect fallback
  const getFirstAccessibleRoute = () => {
    if (isAdmin) return '/admin';
    if (buildAccess) return '/project-board';
    if (programsAccess) return '/programs';
    if (calendarAccess) return '/calendar';
    return '/coaching'; // always accessible
  };

  if (BUILD_ROUTES.includes(path) && !buildAccess) {
    return <Navigate to={getFirstAccessibleRoute()} replace />;
  }

  if (path === '/calendar' && !calendarAccess) {
    return <Navigate to={getFirstAccessibleRoute()} replace />;
  }

  if (path === '/programs' && !programsAccess) {
    return <Navigate to={getFirstAccessibleRoute()} replace />;
  }

  if (path === '/admin' && !isAdmin) {
    return <Navigate to={getFirstAccessibleRoute()} replace />;
  }

  return <>{children}</>;
}
