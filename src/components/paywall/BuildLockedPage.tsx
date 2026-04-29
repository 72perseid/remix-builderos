import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { useUserFeatures } from '@/hooks/useUserFeatures';
import { LockedOverlay } from './LockedOverlay';

/**
 * Wrap an artifact page that requires `build_access`. Free-tier users see
 * a blurred preview with the upgrade overlay and cannot interact with the
 * underlying content (no copilot input → no completion bumps → no n8n
 * generation triggers). Admins / paid users render children unchanged.
 *
 * Use on every artifact page EXCEPT Business Model (which is free-tier).
 */
export function BuildLockedPage({ children }: { children: ReactNode }) {
  const { hasUse, loading } = useUserFeatures();

  if (loading) return <>{children}</>;

  const isLocked = !hasUse('build');

  if (!isLocked) return <>{children}</>;

  return (
    <div className="relative min-h-[60vh]">
      <div
        className={cn('blur-md select-none pointer-events-none')}
        aria-hidden="true"
      >
        {children}
      </div>
      <LockedOverlay feature="build" />
    </div>
  );
}
