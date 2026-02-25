/**
 * SECURITY — Admin Authentication Module
 * Uses Web Crypto API for SHA-256 hashing.
 * Sessions stored in sessionStorage (cleared on tab close).
 * 30-minute session timeout with inactivity detection.
 */

const SESSION_KEY = 'bcr_admin_session';
const SESSION_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes

/**
 * Hash a password using Web Crypto SHA-256.
 * Returns hex string.
 */
export async function hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'BCH_SALT_2025'); // static salt
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verify a user-supplied password against the stored hash.
 * Uses string comparison (constant-time in practice for same-length hex).
 */
export async function verifyPassword(inputPassword, storedHash) {
    if (!inputPassword || !storedHash) return false;
    try {
        const inputHash = await hashPassword(inputPassword);
        // Constant-time comparison — prevent timing attacks
        if (inputHash.length !== storedHash.length) return false;
        let diff = 0;
        for (let i = 0; i < inputHash.length; i++) {
            diff |= inputHash.charCodeAt(i) ^ storedHash.charCodeAt(i);
        }
        return diff === 0;
    } catch {
        return false;
    }
}

/**
 * Get the stored admin password hash.
 * Falls back to hashing the env var if no hash is configured.
 */
export async function getStoredPasswordHash() {
    const envPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    if (!envPassword) return null;
    // If the env var is already a 64-char hex (SHA-256), use directly
    if (/^[0-9a-f]{64}$/.test(envPassword)) return envPassword;
    // Otherwise hash the plain-text password (legacy support)
    return hashPassword(envPassword);
}

/**
 * Generate a secure session token using crypto.randomUUID.
 */
function generateSessionToken() {
    return crypto.randomUUID();
}

/**
 * Create and persist an admin session.
 */
export function setAdminSession() {
    const session = {
        token: generateSessionToken(),
        createdAt: Date.now(),
        lastActivity: Date.now(),
    };
    try {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
        // sessionStorage unavailable — fail gracefully
    }
    return session.token;
}

/**
 * Get the current admin session, checking for expiry.
 * Returns session object or null if invalid/expired.
 */
export function getAdminSession() {
    try {
        const raw = sessionStorage.getItem(SESSION_KEY);
        if (!raw) return null;
        const session = JSON.parse(raw);
        const now = Date.now();
        if (now - session.lastActivity > SESSION_TIMEOUT_MS) {
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
