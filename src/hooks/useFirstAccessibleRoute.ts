import { useEnrollment } from '@/hooks/useEnrollment';

/**
 * Computes the first route the user has access to based on enrollment flags.
 * Priority: build → /project-board, programs → /programs, calendar → /calendar, else /coaching.
 */
export function useFirstAccessibleRoute(): { route: string; loading: boolean } {
  const { buildAccess, programsAccess, calendarAccess, loading } = useEnrollment();

  let route = '/coaching';
  if (buildAccess) route = '/project-board';
  else if (programsAccess) route = '/programs';
  else if (calendarAccess) route = '/calendar';

  return { route, loading };
}
