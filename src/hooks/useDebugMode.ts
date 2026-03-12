import { useState, useEffect, useCallback } from 'react';

export function useDebugMode() {
  const [isDebug, setIsDebug] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    if (params.get('debug') === 'true') {
      sessionStorage.setItem('debug_mode', 'true');
      return true;
    }
    return sessionStorage.getItem('debug_mode') === 'true';
  });

  const toggle = useCallback(() => {
    setIsDebug(prev => {
      const next = !prev;
      if (next) sessionStorage.setItem('debug_mode', 'true');
      else sessionStorage.removeItem('debug_mode');
      return next;
    });
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'D') {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggle]);

  return { isDebug, toggle };
}
