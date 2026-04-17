/**
 * Application-wide constants.
 * Centralizes all magic strings and numbers.
 */

export const APP_NAME = 'Bluecoderhub';
export const COMPANY_NAME = 'Bluecoderhub PVT LTD';
export const COMPANY_TAGLINE = "Building Tomorrow's Digital Solutions";
export const COMPANY_EMAIL = 'connect@bluecoderhub.com';
export const COMPANY_PHONE = '+91 80 1234 5678';
export const COMPANY_LOCATION = 'Chennai, Tamil Nadu, India';
export const COMPANY_FOUNDED = 2022;

// External links
export const SOCIAL_LINKS = {
    linkedin: 'https://linkedin.com/company/bluecoderhub',
    github: 'https://github.com/Blucoderhub',
    twitter: 'https://twitter.com/bluecoderhub',
    instagram: 'https://instagram.com/bluecoderhub',
};

export const PRODUCT_URLS = {
    bluecoderhub: 'https://bluecoderhub.com',
    bluelearnerhub: 'https://bluelearnerhub.com',
};

// File upload settings
export const MAX_FILE_SIZE_MB = 5;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;
export const ALLOWED_RESUME_TYPES = ['.pdf', '.doc', '.docx'];
export const ALLOWED_IMAGE_TYPES = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg'];

// Pagination
export const BLOG_POSTS_PER_PAGE = 9;
export const JOBS_PER_PAGE = 10;

// Animation
export const PAGE_TRANSITION = { duration: 0.3 };
export const FADE_IN_DEFAULTS = { duration: 0.6, ease: 'easeOut' };
