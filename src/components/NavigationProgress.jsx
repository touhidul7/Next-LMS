'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * Lightweight top progress bar — no external dependencies.
 * Uses a CSS animation trick: bar races to ~85% then completes on navigation end.
 */
export default function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [state, setState] = useState('idle'); // 'idle' | 'loading' | 'done'
  const prevUrl = useRef(`${pathname}${searchParams}`);
  const doneTimer = useRef(null);

  const start = useCallback(() => {
    clearTimeout(doneTimer.current);
    setState('loading');
  }, []);

  const done = useCallback(() => {
    setState('done');
    doneTimer.current = setTimeout(() => setState('idle'), 400);
  }, []);

  // Trigger "done" whenever the route actually changes
  useEffect(() => {
    const current = `${pathname}${searchParams}`;
    if (current !== prevUrl.current) {
      prevUrl.current = current;
      done();
    }
  }, [pathname, searchParams, done]);

  // Intercept link clicks to trigger "start"
  useEffect(() => {
    const handleClick = (e) => {
      const anchor = e.target.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      // Only internal links (not hash, mailto, tel, external)
      if (
        href.startsWith('/') &&
        !href.startsWith('//') &&
        !anchor.target &&
        !e.metaKey &&
        !e.ctrlKey &&
        !e.shiftKey
      ) {
        start();
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [start]);

  // Also hook into form submissions / programmatic router pushes via popstate
  useEffect(() => {
    const handlePopState = () => start();
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [start]);

  if (state === 'idle') return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '2.5px',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        style={{
          height: '100%',
          background: 'linear-gradient(90deg, #175cff, #fa8b98, #175cff)',
          backgroundSize: '200% 100%',
          boxShadow: '0 0 10px 1px rgba(250,139,152,0.6)',
          borderRadius: '0 2px 2px 0',
          animation:
            state === 'loading'
              ? 'nprogress-run 2.5s ease-out forwards, nprogress-shimmer 1.2s linear infinite'
              : 'nprogress-finish 0.3s ease-out forwards',
          transformOrigin: 'left center',
        }}
      />
    </div>
  );
}
