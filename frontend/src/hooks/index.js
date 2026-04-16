/**
 * Barrel export for custom hooks.
 * Provides a single import path for all hooks.
 * 
 * Usage:
 *   import { useScroll, useIntersection } from './hooks';
 */

export { useScroll } from './useScroll.js';
export { useScrollTrigger, useGSAPContext, gsap, ScrollTrigger } from './useScrollTrigger.js';
export { useIntersection } from './useIntersection.js';
export { useAI } from './useAI.js';