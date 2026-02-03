import { Navigate, useLocation, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useXanoSync } from '@/hooks/useXanoSync';
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
  const isAllowedMode = mode === 'new' || mode === 'setup';

  // Auto-sync Xano data when user is authenticated
  useXanoSync(user);

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

  if (loading || profileLoading || appsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If profile exists and user hasn't completed onboarding, redirect to onboarding
  // Skip redirect if already on onboarding page OR if user explicitly skipped
  const isOnOnboardingPage = location.pathname === '/onboarding';
  const hasSkippedOnboarding = sessionStorage.getItem('onboarding_skipped') === 'true';
  
  // Skip onboarding redirect if user has existing apps (returning user)
  if (profile && profile.onboarded === false && !isOnOnboardingPage && !hasSkippedOnboarding && !hasExistingApps) {
    return <Navigate to="/onboarding" replace />;
  }

  // If user is on onboarding page but already onboarded, redirect to dashboard
  // Unless they're in "new app" mode (creating a second app)
  if (profile && profile.onboarded === true && isOnOnboardingPage && !isAllowedMode) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
