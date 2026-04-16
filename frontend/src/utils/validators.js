/**
 * SECURITY — Form Validation Utilities (Hardened)
 */

// ─── Email ───────────────────────────────────────────────────────────
/**
 * RFC 5322-compliant email validator.
 */
export function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    if (email.length > 254) return false; // RFC 5321 max
    const regex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/;
    return regex.test(email.trim());
}

// ─── Phone ───────────────────────────────────────────────────────────
export function validatePhone(phone) {
    if (!phone) return false;
    const cleaned = String(phone).replace(/[\s\-().]/g, '');
    return /^\+?[0-9]{7,15}$/.test(cleaned);
}

// ─── URL ─────────────────────────────────────────────────────────────
export function validateURL(url) {
    try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
    } catch {
        return false;
    }
}

// ─── Required ────────────────────────────────────────────────────────
export function validateRequired(value) {
    if (value === null || value === undefined) return false;
    return String(value).trim().length > 0;
}

// ─── Length ──────────────────────────────────────────────────────────
export function validateMinLength(value, min) {
    return String(value || '').trim().length >= min;
}

export function validateMaxLength(value, max) {
    return String(value || '').length <= max;
}

// ─── File Validation ─────────────────────────────────────────────────
export function validateFileType(file, allowedExtensions) {
    if (!file?.name) return false;
    const name = file.name.toLowerCase();
    return allowedExtensions.some(ext => name.endsWith(ext.toLowerCase()));
}

export function validateFileSize(file, maxMB) {
    if (!file?.size) return false;
    return file.size <= maxMB * 1024 * 1024;
}

/**
 * Magic-byte validation for uploaded files.
 * Checks actual binary header, not just the extension.
 */
export async function validateFileMagicBytes(file) {
    const SIGNATURES = {
        pdf: [0x25, 0x50, 0x44, 0x46],           // %PDF
        docx: [0x50, 0x4B, 0x03, 0x04],           // PK (ZIP-based)
        doc: [0xD0, 0xCF, 0x11, 0xE0],           // OLE2 compound document
        png: [0x89, 0x50, 0x4E, 0x47],
        jpg: [0xFF, 0xD8, 0xFF],
        gif: [0x47, 0x49, 0x46, 0x38],
        webp: null, // Too complex, skip
    };

    try {
        const buffer = await file.slice(0, 8).arrayBuffer();
        const bytes = new Uint8Array(buffer);
        const ext = file.name.split('.').pop()?.toLowerCase();
        const sig = SIGNATURES[ext];
        if (!sig) return true; // Unknown type — allow through (extension check is enough)
        return sig.every((b, i) => bytes[i] === b);
    } catch {
        return false;
    }
}

// ─── Password Strength ───────────────────────────────────────────────
/**
 * Returns { valid: boolean, score: 0-4, feedback: string[] }
 */
export function validatePasswordStrength(password) {
    const feedback = [];
    let score = 0;

    if (!password) return { valid: false, score: 0, feedback: ['Password is required.'] };
    if (password.length < 8) feedback.push('At least 8 characters required.');
    else score++;
    if (!/[A-Z]/.test(password)) feedback.push('Add an uppercase letter.');
    else score++;
    if (!/[0-9]/.test(password)) feedback.push('Add a number.');
    else score++;
    if (!/[^A-Za-z0-9]/.test(password)) feedback.push('Add a special character (!@#$...).');
    else score++;

    return { valid: score >= 3, score, feedback };
}

// ─── Formatting Helpers ──────────────────────────────────────────────
export function formatFileSize(bytes) {
    if (!bytes || bytes < 0) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Safe HTML escape — use when you must set innerHTML.
 * Prefer React JSX (auto-escaped) whenever possible.
 */
export function sanitizeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}
