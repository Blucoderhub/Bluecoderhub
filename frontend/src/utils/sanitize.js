import { 
    sanitizeInput as securitySanitizeInput,
    sanitizeLongText as securitySanitizeLongText,
    sanitizeEmail as securitySanitizeEmail,
    sanitizeFileName as securitySanitizeFileName,
    sanitizeURL as securitySanitizeURL,
    escapeHTML as securityEscapeHTML,
    sanitizeForPrompt as securitySanitizeForPrompt
} from '../security/sanitize';

export function sanitizeInput(value, maxLength) {
    return securitySanitizeInput(value, maxLength);
}

export function sanitizeLongText(value) {
    return securitySanitizeLongText(value);
}

export function sanitizeEmail(email) {
    return securitySanitizeEmail(email);
}

export function sanitizeFileName(name) {
    return securitySanitizeFileName(name);
}

export function sanitizeURL(url) {
    return securitySanitizeURL(url);
}

export function escapeHTML(str) {
    return securityEscapeHTML(str);
}

export function sanitizeForPrompt(value, maxLength) {
    return securitySanitizeForPrompt(value, maxLength);
}

export function sanitizeBlogContent(content) {
    if (!content) return '';
    return securitySanitizeLongText(content);
}