/**
 * SECURITY — Client-Side Rate Limiter
 * Token-bucket algorithm, stored in sessionStorage.
 * Does NOT replace server-side rate limiting — use as UX guard layer.
 */

const STORAGE_KEY = 'bcr_rl_';

/**
 * Rate limit configuration per action key.
 * maxCalls: max allowed calls in windowMs milliseconds.
 */
export const RATE_LIMITS = {
    contact_form: { maxCalls: 1, windowMs: 60_000 },  // 1 per minute
    application: { maxCalls: 2, windowMs: 300_000 },  // 2 per 5 minutes
    ai_call: { maxCalls: 5, windowMs: 60_000 },  // 5 per minute
    newsletter: { maxCalls: 1, windowMs: 60_000 },  // 1 per minute
    admin_login: { maxCalls: 3, windowMs: 60_000 },  // 3 per minute → lockout
};

function getRecord(key) {
    try {
        const raw = sessionStorage.getItem(STORAGE_KEY + key);
        return raw ? JSON.parse(raw) : { calls: [], lockedUntil: 0 };
    } catch {
        return { calls: [], lockedUntil: 0 };
    }
}

function saveRecord(key, record) {
    try {
        sessionStorage.setItem(STORAGE_KEY + key, JSON.stringify(record));
    } catch {
        // sessionStorage full — fail open (don't block user silently)
    }
}

/**
 * Check if an action is allowed under rate limit rules.
 * @returns {{ allowed: boolean, waitMs: number, attemptsLeft: number }}
 */
export function checkRateLimit(actionKey) {
    const config = RATE_LIMITS[actionKey];
    if (!config) return { allowed: true, waitMs: 0, attemptsLeft: 999 };

    const now = Date.now();
    const record = getRecord(actionKey);

    // Check lockout
    if (record.lockedUntil && now < record.lockedUntil) {
        return {
            allowed: false,
            waitMs: record.lockedUntil - now,
            attemptsLeft: 0,
            locked: true,
        };
    }

    // Prune expired calls outside the window
    record.calls = record.calls.filter(t => now - t < config.windowMs);

    const attemptsLeft = Math.max(0, config.maxCalls - record.calls.length);
    const allowed = record.calls.length < config.maxCalls;

    if (!allowed) {
        const oldestCall = Math.min(...record.calls);
        const waitMs = config.windowMs - (now - oldestCall);
        return { allowed: false, waitMs: Math.max(0, waitMs), attemptsLeft: 0 };
    }

    return { allowed: true, waitMs: 0, attemptsLeft };
}

/**
 * Record a successful action call.
 * Call this AFTER the action succeeds.
 */
export function recordCall(actionKey) {
    const config = RATE_LIMITS[actionKey];
    if (!config) return;

    const now = Date.now();
    const record = getRecord(actionKey);
    record.calls = record.calls.filter(t => now - t < config.windowMs);
    record.calls.push(now);

    // Lock out on exhaustion (for critical paths like login)
    if (actionKey === 'admin_login' && record.calls.length >= config.maxCalls) {
        record.lockedUntil = now + config.windowMs;
    }

    saveRecord(actionKey, record);
}

/**
 * Reset rate limit for an action key (e.g. on successful admin login).
 */
export function resetRateLimit(actionKey) {
    try {
        sessionStorage.removeItem(STORAGE_KEY + actionKey);
    } catch {
        // ignore
    }
}

/**
 * Format wait time in human-readable form.
 */
export function formatWaitTime(ms) {
    if (ms < 1000) return 'a moment';
    const seconds = Math.ceil(ms / 1000);
    if (seconds < 60) return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    const minutes = Math.ceil(seconds / 60);
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
}
