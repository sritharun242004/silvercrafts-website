/**
 * Custom hook for scroll animations using Intersection Observer
 */

import { useEffect } from 'react';
import { setupIntersectionObserver, observeAnimatedElements, cleanupObserver } from '../utils/animations';

/**
 * Hook to setup scroll animations for elements
 * @param dependencies Dependencies to re-run the effect
 */
export function useScrollAnimation(dependencies: any[] = []) {
  useEffect(() => {
    const observer = setupIntersectionObserver();
    const { elements, sections } = observeAnimatedElements(observer);

    return () => {
      cleanupObserver(observer, elements, sections);
    };
  }, dependencies);
}

