/**
 * Shared GSAP ScrollTrigger setup.
 * Import this once per component that uses ScrollTrigger.
 * Always call the returned cleanup function in useEffect's return.
 */
import { useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export { gsap, ScrollTrigger };

/**
 * Helper: kill all ScrollTriggers created in a given context on cleanup.
 * Usage:
 *   const ctx = gsap.context(() => { ... animations ... }, containerRef);
 *   return () => ctx.revert();
 */
export function useGSAPContext(setupFn, deps = []) {
    useEffect(() => {
        const ctx = gsap.context(setupFn);
        return () => ctx.revert();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);
}
