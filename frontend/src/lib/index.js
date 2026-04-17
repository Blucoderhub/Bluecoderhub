/**
 * Barrel export for utility modules.
 * Provides a single import path for all utilities.
 * 
 * Usage:
 *   import { validateEmail, sanitizeInput } from './lib';
 */

export { validateEmail, validatePhone, validateURL, validateRequired } from '../utils/validators.js';
export { sanitizeInput, sanitizeEmail, sanitizeFileName, sanitizeURL } from '../security/sanitize.js';
export { api, getAuthToken, setAuthToken, clearAuthToken } from '../utils/api.js';
