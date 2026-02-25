'use client';

import { useState, useEffect } from 'react';

type BreakpointKey = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const breakpoints: Record<BreakpointKey, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);

  return matches;
}

export function useBreakpoint(breakpoint: BreakpointKey): boolean {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`);
}

export function useIsMobile(): boolean {
  return !useBreakpoint('md');
}
