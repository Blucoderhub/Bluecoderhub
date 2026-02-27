/**
 * SECURITY — Admin Authentication Module
 * Uses Web Crypto API PBKDF2 for password hashing (310,000 iterations, random salt).
 * Sessions stored in sessionStorage (cleared on tab close).
 * 30-minute session timeout with inactivity detection.
 */

const SESSION_KEY = 'bcr_admin_session';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const PBKDF2_ITERATIONS = 310000; // OWASP 2023 recommendation
const PBKDF2_PREFIX = 'pbkdf2v1';

/**
 * In-memory set of tokens issued during this page lifecycle.
 *
 * Security guarantee: An attacker who manually writes to sessionStorage
 * cannot forge a valid session because they have no way to add a token
 * to this Set. Sessions intentionally do NOT survive page reloads —
 * the user must re-authenticate (improves security vs. convenience trade-off).
 */
const _validTokens = new Set();

/**
 * Hash a password using PBKDF2-SHA-256 with a random 16-byte salt.
 * Returns a self-contained string: "pbkdf2v1:{iterations}:{saltHex}:{hashHex}"
 * Store this output as VITE_ADMIN_PASSWORD in your .env file.
 */
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');

    const keyMaterial = await crypto.subtle.importKey(
        'raw',
        encoder.encode(password),
        'PBKDF2',
        false,
        ['deriveBits']
    );

    const derivedBits = await crypto.subtle.deriveBits(
        { name: 'PBKDF2', salt, iterations: PBKDF2_ITERATIONS, hash: 'SHA-256' },
        keyMaterial,
        256
    );

    const hashHex = Array.from(new Uint8Array(derivedBits))
        .map(b => b.toString(16).padStart(2, '0')).join('');

    return `${PBKDF2_PREFIX}:${PBKDF2_ITERATIONS}:${saltHex}:${hashHex}`;
}

/**
 * Legacy SHA-256 hash (backward compatibility only — do not use for new passwords).
 */
async function _legacyHash(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'BCH_SALT_2025');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a user-supplied password against a stored hash.
 * Supports both PBKDF2 (new) and legacy SHA-256 (old) formats.
 */
export async function verifyPassword(inputPassword, storedHash) {
    if (!inputPassword || !storedHash) return false;
    try {
        if (storedHash.startsWith(PBKDF2_PREFIX + ':')) {
            // Format: pbkdf2v1:{iterations}:{saltHex}:{hashHex}
            const parts = storedHash.split(':');
            if (parts.length !== 4) return false;
            const [, iterStr, saltHex, expectedHash] = parts;
            const iterations = parseInt(iterStr, 10);
            if (!iterations || iterations < 100000) return false;

            const salt = new Uint8Array(saltHex.match(/.{2}/g).map(b => parseInt(b, 16)));
            const encoder = new TextEncoder();
            const keyMaterial = await crypto.subtle.importKey(
                'raw',
                encoder.encode(inputPassword),
                'PBKDF2',
                false,
                ['deriveBits']
            );
            const derivedBits = await crypto.subtle.deriveBits(
                { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
                keyMaterial,
                256
            );
            const inputHashHex = Array.from(new Uint8Array(derivedBits))
                .map(b => b.toString(16).padStart(2, '0')).join('');

            // Constant-time comparison
            if (inputHashHex.length !== expectedHash.length) return false;
            let diff = 0;
            for (let i = 0; i < inputHashHex.length; i++) {
                diff |= inputHashHex.charCodeAt(i) ^ expectedHash.charCodeAt(i);
            }
            return diff === 0;

        } else if (/^[0-9a-f]{64}$/.test(storedHash)) {
            // Legacy SHA-256 format — backward compatibility
            const inputHash = await _legacyHash(inputPassword);
            if (inputHash.length !== storedHash.length) return false;
            let diff = 0;
            for (let i = 0; i < inputHash.length; i++) {
                diff |= inputHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
            }
            return diff === 0;
        }

        return false;
    } catch {
        return false;
    }
}

/**
 * Get the stored admin password hash from environment.
 * Accepts PBKDF2 format ("pbkdf2v1:...") or legacy SHA-256 (64-char hex).
 * Plain-text passwords are NOT accepted — always store a pre-generated hash.
 */
export async function getStoredPasswordHash() {
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!envPassword) return null;

    // PBKDF2 hash (new format)
    if (envPassword.startsWith(PBKDF2_PREFIX + ':')) return envPassword;

    // Legacy SHA-256 hash (64-char hex)
    if (/^[0-9a-f]{64}$/.test(envPassword)) return envPassword;

    // Unknown format — do not accept to prevent security misconfigurations
    return null;
}

/**
 * Generate a secure session token using crypto.randomUUID.
 */
function generateSessionToken() {
    return crypto.randomUUID();
}

/**
 * Create and persist an admin session.
 * Token is registered in _validTokens (in-memory) so it cannot be spoofed.
 */
export function setAdminSession() {
    const token = generateSessionToken();
    _validTokens.add(token);
    const session = {
        token,
        createdAt: Date.now(),
        lastActivity: Date.now(),
    };
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
        // sessionStorage unavailable — fail gracefully
    }
    return token;
}

/**
 * Get the current admin session, checking for expiry and in-memory token validity.
 * Returns session object or null if invalid/expired/spoofed.
 */
export function getAdminSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        if (!session || typeof session !== 'object') return null;
        if (!session.token || !session.createdAt || !session.lastActivity) return null;

        // Validate against in-memory token registry — prevents sessionStorage spoofing
        if (!_validTokens.has(session.token)) {
            clearAdminSession();
            return null;
        }

        const now = Date.now();
        if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
            _validTokens.delete(session.token);
            clearAdminSession();
            return null;
        }
        // Refresh activity timestamp
        session.lastActivity = now;
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        return session;
    } catch {
        return null;
    }
}

/**
 * Check if admin is authenticated.
 */
export function isAdminAuthenticated() {
    return getAdminSession() !== null;
}

/**
 * Destroy the admin session (logout).
 */
export function clearAdminSession() {
    try {
        // Also remove from in-memory registry
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (raw) {
            const session = JSON.parse(raw);
            if (session?.token) _validTokens.delete(session.token);
        }
        sessionStorage.removeItem(SESSION_KEY);
    } catch {
        // ignore
    }
}

/**
 * Get session age in minutes (for display).
 */
export function getSessionAgeMinutes() {
    const session = getAdminSession();
    if (!session) return 0;
    return Math.floor((Date.now() - session.createdAt) / 60000);
}
