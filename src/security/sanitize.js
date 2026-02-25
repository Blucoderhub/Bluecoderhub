/**
 * SECURITY — Input Sanitization Module
 * Prevents XSS, prompt injection, and path traversal attacks.
 */

const MAX_INPUT_LENGTH = 5000;
const MAX_SHORT_LENGTH = 500;
const MAX_EMAIL_LENGTH = 254; // RFC 5321

/**
 * Strip HTML/script tags and limit string length.
 * Safe for use before storing or injecting into prompts.
 */
export function sanitizeInput(value, maxLength = MAX_SHORT_LENGTH) {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // Remove HTML tags
    const stripped = str
        .replace(/<[^>]*>/g, '')
        // Remove dangerous JS protocols
        .replace(/javascript:/gi, '')
        .replace(/data:/gi, '')
        .replace(/vbscript:/gi, '')
        // Remove null bytes
        .replace(/\0/g, '')
        .trim();
    return stripped.slice(0, maxLength);
}

/**
 * Sanitize a long text field (e.g. cover letter, message).
 */
export function sanitizeLongText(value) {
    return sanitizeInput(value, MAX_INPUT_LENGTH);
}

/**
 * Validate and normalize an email address.
 * Returns sanitized email or null if invalid.
 */
export function sanitizeEmail(email) {
    if (!email) return null;
    const sanitized = String(email).toLowerCase().trim().slice(0, MAX_EMAIL_LENGTH);
    // RFC 5322-ish regex — stricter than basic
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    return emailRegex.test(sanitized) ? sanitized : null;
}

/**
 * Sanitize a file name — prevents path traversal.
 */
export function sanitizeFileName(name) {
    if (!name) return 'unnamed';
    return String(name)
        .replace(/[/\\?%*:|"<>]/g, '') // remove path separators
        .replace(/\.\./g, '')           // remove directory traversal
        .replace(/^\./, '')             // remove leading dot
        .trim()
        .slice(0, 255);
}

/**
 * Sanitize a URL — only allows http/https protocols.
 */
export function sanitizeURL(url) {
    if (!url) return '';
    const s = String(url).trim();
    try {
        const parsed = new URL(s);
        if (!['http:', 'https:'].includes(parsed.protocol)) return '';
        return parsed.href;
    } catch {
        return '';
    }
}

/**
 * Escape HTML entities for safe display in innerHTML contexts.
 * Prefer using React's JSX (auto-escaped) over this whenever possible.
 */
export function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;');
}

/**
 * Strip all non-printable / control characters from a string.
 */
export function sanitizeForPrompt(value, maxLength = MAX_SHORT_LENGTH) {
    const sanitized = sanitizeInput(value, maxLength);
    // Remove control characters that could manipulate AI prompts
    return sanitized
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
