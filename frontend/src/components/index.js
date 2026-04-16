/**
 * Barrel export for all components.
 * Provides a single import path for all components by category.
 * 
 * Usage:
 *   import { Button, Navbar } from './components';
 *   import { FadeInSection, LiquidBlob } from './components/animations';
 */

export * from './common/index.js';
export * from './animations/index.js';
export * from './layout/index.js';

export { default as SelfHealingPanel } from './admin/SelfHealingPanel.jsx';