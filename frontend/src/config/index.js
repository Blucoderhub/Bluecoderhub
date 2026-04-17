/**
 * Barrel export for configuration modules.
 * Provides a single import path for all config.
 * 
 * Usage:
 *   import { ROUTES, APP_NAME, PAGE_TRANSITION } from './config';
 */

export { ROUTES } from './routes.js';
export {
    APP_NAME,
    COMPANY_NAME,
    COMPANY_TAGLINE,
    COMPANY_EMAIL,
    COMPANY_PHONE,
    COMPANY_LOCATION,
    COMPANY_FOUNDED,
    SOCIAL_LINKS,
    PRODUCT_URLS,
    MAX_FILE_SIZE_MB,
    MAX_FILE_SIZE_BYTES,
    ALLOWED_RESUME_TYPES,
    ALLOWED_IMAGE_TYPES,
    BLOG_POSTS_PER_PAGE,
    JOBS_PER_PAGE,
    PAGE_TRANSITION,
    FADE_IN_DEFAULTS,
} from './constants.js';
