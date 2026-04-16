/**
 * Bluecoderhub — Main Barrel Export
 * 
 * Centralized import path for all modules.
 * Enables clean imports throughout the application.
 * 
 * Usage:
 *   import { Home, Button } from './src';
 *   import { ROUTES, APP_NAME } from './src/config';
 *   import { useScroll, useAI } from './src/hooks';
 */

// Core exports
export * from './config/index.js';
export * from './components/index.js';
export * from './hooks/index.js';
export * from './data/index.js';
export * from './lib/index.js';

// Page exports
export * from './pages/index.js';

// Self-healing exports
export {
    initSelfHealing,
    isSelfHealingEnabled,
    setSelfHealingEnabled,
    calculateHealthScore,
    getHealingLog,
    subscribe as subscribeHealing,
    DEFAULT_CONFIG,
} from './utils/selfHealing.js';

// App entry
export { default as App } from './App.jsx';
export { default } from './App.jsx';