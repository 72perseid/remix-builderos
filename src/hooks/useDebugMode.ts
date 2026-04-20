import { useState, useEffect, useCallback } from 'react';
import { useIsAdmin } from '@/hooks/useIsAdmin';

export function useDebugMode() {
  const { isAdmin, loading } = useIsAdmin();
  const [isDebug, setIsDebug] = useState(false);

  // Sync state with admin status + URL/sessionStorage
  useEffect(() => {
    if (loading) return;

    if (!isAdmin) {
      // Non-admin: forcibly clear any stale debug flag and stay off
      sessionStorage.removeItem('debug_mode');
      setIsDebug(false);
      return;
    }

    // Admin: respect URL param and sessionStorage
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true') {
      sessionStorage.setItem('debug_mode', 'true');
      setIsDebug(true);
    } else {
      setIsDebug(sessionStorage.getItem('debug_mode') === 'true');
    }
  }, [isAdmin, loading]);

  const toggle = useCallback(() => {
    if (!isAdmin) return;
    setIsDebug(prev => {
      const next = !prev;
      if (next) sessionStorage.setItem('debug_mode', 'true');
      else sessionStorage.removeItem('debug_mode');
      return next;
    });
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle, isAdmin]);

  return { isDebug, toggle };
}
