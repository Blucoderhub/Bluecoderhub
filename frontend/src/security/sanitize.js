/**
 * SECURITY — Input Sanitization Module
 * Prevents XSS-oriented payloads and path traversal attacks.
 *
 * NOTE: React JSX auto-escapes all values rendered as text nodes.
 * These functions are primarily used before any non-JSX HTML context
 * such as innerHTML. Prefer React text rendering whenever possible.
 */

const MAX_INPUT_LENGTH = 5000;
const MAX_SHORT_LENGTH = 500;
const MAX_EMAIL_LENGTH = 254; // RFC 5321

/**
 * Decode common HTML entities to catch encoded XSS payloads
 * (e.g. &#60;script&#62; → <script>).
 */
function decodeEntities(str) {
    return str
        .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
        .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
        .replace(/&lt;/gi, '<')
        .replace(/&gt;/gi, '>')
        .replace(/&amp;/gi, '&')
        .replace(/&quot;/gi, '"')
        .replace(/&#x27;/gi, "'")
        .replace(/&apos;/gi, "'");
}

/**
 * Strip HTML/script tags, dangerous protocols, event handlers, and limit string length.
 * Safe for normalizing user-controlled text before storage or display.
 */
export function sanitizeInput(value, maxLength = MAX_SHORT_LENGTH) {
    if (value === null || value === undefined) return '';
    let str = String(value);

    // Decode entities first to expose encoded attack patterns
    str = decodeEntities(str);

    const stripped = str
        // Remove HTML/XML tags (including their attributes and event handlers)
        .replace(/<[^>]*>/g, '')
        // Remove dangerous URL protocols (case-insensitive, handles spaces/newlines in protocol)
        .replace(/j[\s\S]*a[\s\S]*v[\s\S]*a[\s\S]*s[\s\S]*c[\s\S]*r[\s\S]*i[\s\S]*p[\s\S]*t[\s\S]*:/gi, '')
        .replace(/v[\s\S]*b[\s\S]*s[\s\S]*c[\s\S]*r[\s\S]*i[\s\S]*p[\s\S]*t[\s\S]*:/gi, '')
        .replace(/data:/gi, '')
        // Remove standalone event handler patterns (outside of tags)
        .replace(/on\w+\s*=/gi, '')
        // Remove CSS expression() attacks
        .replace(/expression\s*\(/gi, '')
        // Remove null bytes and other control characters
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
 * Returns empty string for any other protocol (javascript:, data:, vbscript:, etc.)
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
 * Used before sending user-controlled text to sensitive processors.
 */
export function sanitizeForPrompt(value, maxLength = MAX_SHORT_LENGTH) {
    const sanitized = sanitizeInput(value, maxLength);
    // Remove control characters that could manipulate downstream parsing
    return sanitized
        .replace(/[\x00-\x1F\x7F]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}
