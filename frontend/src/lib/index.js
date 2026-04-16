/**
 * Barrel export for utility modules.
 * Provides a single import path for all utilities.
 * 
 * Usage:
 *   import { storage, validateEmail, sanitizeInput } from './lib';
 */

export { storage } from '../utils/storage.js';
export { validateEmail, validatePhone, validateURL, validateRequired } from '../utils/validators.js';
export { sanitizeInput, sanitizeEmail, sanitizeFileName, sanitizeURL } from '../security/sanitize.js';
export { checkRateLimit, recordCall, resetRateLimit, formatWaitTime } from '../security/rateLimit.js';
export { isAdminAuthenticated, verifyPassword, hashPassword } from '../security/auth.js';
export { modifyContent, generateBlogContent, suggestImprovements } from '../utils/ai.js';