/**
 * Self-Healing Engine — Bluecoderhub
 *
 * Continuously monitors site health and auto-repairs content using AI.
 * Only an authenticated admin can pause or stop the modification cycle.
 *
 * Storage keys (prefix: bluecoderhub_sh_):
 *   _enabled      — boolean kill-switch (admin-controlled)
 *   _config       — engine configuration
 *   _log          — audit log of all modifications
 *   _snapshots    — content snapshots per page (before any mutation)
 *   _last_heal    — ISO timestamp of last successful cycle
 *   _health       — health score history
 */

import { isAdminAuthenticated } from '../security/auth.js';
import { modifyContent } from './ai.js';
import { STORAGE_PREFIX } from '../config/constants.js';

// ─── Constants ─────────────────────────────────────────────────────────────

const SH = STORAGE_PREFIX + 'sh_';

const KEYS = {
    ENABLED:    SH + 'enabled',
    CONFIG:     SH + 'config',
    LOG:        SH + 'log',
    SNAPSHOTS:  SH + 'snapshots',
    LAST_HEAL:  SH + 'last_heal',
    HEALTH:     SH + 'health',
};

const PAGE_KEY = (page) => STORAGE_PREFIX + 'page_' + page;

export const DEFAULT_CONFIG = {
    interval: 30,          // minutes between healing cycles
    maxLogEntries: 200,  // max audit log entries kept
    autoRepairData: true, // fix corrupted localStorage entries
    autoRefreshContent: false, // AI-powered content updates (disabled - content is static)
    healingIntensity: 'moderate', // 'minimal' | 'moderate' | 'aggressive'
    targetPages: ['home', 'about', 'products', 'careers'],
    contentSections: {
        home:     ['hero_title', 'hero_subtitle', 'cta_text', 'mission_statement'],
        about:    ['mission', 'vision', 'values'],
        careers:  ['culture_text', 'perks_description'],
        products: ['intro_text', 'tagline'],
    },
};

// ─── In-memory state ───────────────────────────────────────────────────────

let _timer = null;
let _running = false;
let _listeners = [];  // React state updaters subscribed for live reload

// ─── Subscriber (for React live updates) ──────────────────────────────────

export function subscribe(fn) {
    _listeners.push(fn);
    return () => { _listeners = _listeners.filter(l => l !== fn); };
}

function _notify() {
    _listeners.forEach(fn => { try { fn(); } catch { /* ignore */ } });
}

// ─── Safe localStorage helpers ────────────────────────────────────────────

function _get(key, fallback = null) {
    try {
        const raw = localStorage.getItem(key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

function _set(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch {
        return false;
    }
}

// ─── Configuration ─────────────────────────────────────────────────────────

export function getSelfHealingConfig() {
    const stored = _get(KEYS.CONFIG, {});
    return { ...DEFAULT_CONFIG, ...stored };
}

export function saveSelfHealingConfig(patch) {
    if (!isAdminAuthenticated()) throw new Error('Admin authentication required');
    const current = getSelfHealingConfig();
    _set(KEYS.CONFIG, { ...current, ...patch });
    _notify();
}

// ─── Enabled / Disabled ────────────────────────────────────────────────────

export function isSelfHealingEnabled() {
    // Default: enabled (null means never explicitly disabled)
    const val = localStorage.getItem(KEYS.ENABLED);
    return val === null ? true : val === 'true';
}

/**
 * Toggle self-healing on or off.
 * REQUIRES an active admin session — cannot be changed by public users.
 */
export function setSelfHealingEnabled(enabled) {
    if (!isAdminAuthenticated()) {
        throw new Error('Admin authentication required to control self-healing');
    }
    try {
        localStorage.setItem(KEYS.ENABLED, String(Boolean(enabled)));
    } catch { /* storage full — ignore */ }

    if (enabled) {
        _addLog('system', 'Self-healing ENABLED by admin', 'success');
        startHealingCycle();
    } else {
        _addLog('system', 'Self-healing PAUSED by admin', 'warning');
        stopHealingCycle();
    }
    _notify();
}

// ─── Audit Log ─────────────────────────────────────────────────────────────

export function getHealingLog() {
    return _get(KEYS.LOG, []);
}

function _addLog(type, message, severity = 'info', details = null) {
    const entry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        timestamp: new Date().toISOString(),
        type,      // 'system' | 'content_update' | 'data_repair' | 'error_recovery' | 'snapshot'
        message,
        severity,  // 'info' | 'success' | 'warning' | 'error'
        details,
    };

    const cfg = getSelfHealingConfig();
    const maxEntries = cfg.maxLogEntries || 200;
    const current = getHealingLog();
    const updated = [entry, ...current].slice(0, maxEntries);
    _set(KEYS.LOG, updated);
    _notify();
    return entry;
}

export function clearHealingLog() {
    if (!isAdminAuthenticated()) throw new Error('Admin authentication required');
    localStorage.removeItem(KEYS.LOG);
    _addLog('system', 'Audit log cleared by admin', 'info');
    _notify();
}

// ─── Content Snapshots ─────────────────────────────────────────────────────

export function getContentSnapshots() {
    return _get(KEYS.SNAPSHOTS, {});
}

export function takeContentSnapshot(page, content) {
    const snapshots = getContentSnapshots();
    if (!snapshots[page]) snapshots[page] = [];

    snapshots[page].unshift({
        id: Date.now().toString(36),
        timestamp: new Date().toISOString(),
        content: JSON.stringify(content),
    });

    // Keep at most 5 snapshots per page
    snapshots[page] = snapshots[page].slice(0, 5);
    _set(KEYS.SNAPSHOTS, snapshots);

    _addLog('snapshot', `Snapshot taken for page: ${page}`, 'info', { page });
    return true;
}

/**
 * Restore a specific snapshot. Admin only.
 */
export function restoreFromSnapshot(page, snapshotId) {
    if (!isAdminAuthenticated()) throw new Error('Admin authentication required');

    const snapshots = getContentSnapshots();
    const snap = (snapshots[page] || []).find(s => s.id === snapshotId);
    if (!snap) return false;

    try {
        const content = JSON.parse(snap.content);
        _set(PAGE_KEY(page), content);
        _addLog('snapshot', `Content restored from snapshot for: ${page}`, 'success', { page, snapshotId });
        _notify();
        return true;
    } catch {
        return false;
    }
}

// ─── Health Scoring ────────────────────────────────────────────────────────

export function calculateHealthScore() {
    const cfg = getSelfHealingConfig();
    const pageScores = {};
    let totalScore = 0;
    let pageCount = 0;

    for (const page of cfg.targetPages) {
        const content = _get(PAGE_KEY(page), {});
        const sections = cfg.contentSections[page] || [];
        let score = 100;

        for (const section of sections) {
            const val = content[section];
            if (!val || String(val).trim().length < 10) {
                score -= Math.floor(100 / Math.max(sections.length, 1));
            }
        }

        pageScores[page] = Math.max(0, score);
        totalScore += pageScores[page];
        pageCount++;
    }

    const overall = pageCount > 0 ? Math.round(totalScore / pageCount) : 100;
    const status = overall >= 80 ? 'healthy' : overall >= 55 ? 'degraded' : 'critical';

    const health = {
        overall,
        pages: pageScores,
        timestamp: new Date().toISOString(),
        status,
    };

    // Store last 10 health readings
    const history = _get(KEYS.HEALTH, []);
    _set(KEYS.HEALTH, [health, ...history].slice(0, 10));

    return health;
}

export function getHealthHistory() {
    return _get(KEYS.HEALTH, []);
}

export function getLastHealTime() {
    return localStorage.getItem(KEYS.LAST_HEAL);
}

// ─── Data Integrity Repair ─────────────────────────────────────────────────

async function _repairDataIntegrity() {
    const corrupted = [];

    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (!key || key.startsWith(SH)) continue; // skip self-healing keys
        if (!key.startsWith(STORAGE_PREFIX)) continue;

        try {
            const raw = localStorage.getItem(key);
            if (raw) JSON.parse(raw);
        } catch {
            corrupted.push(key);
        }
    }

    for (const key of corrupted) {
        localStorage.removeItem(key);
    }

    if (corrupted.length > 0) {
        _addLog(
            'data_repair',
            `Repaired ${corrupted.length} corrupted storage entry${corrupted.length > 1 ? 's' : ''}`,
            'success',
            { keys: corrupted }
        );
    }

    return corrupted.length;
}

// ─── AI Content Healing ────────────────────────────────────────────────────

async function _healPage(page, sections) {
    const current = _get(PAGE_KEY(page), {});

    // Snapshot before modifying
    takeContentSnapshot(page, current);

    const cfg = getSelfHealingConfig();
    let healedCount = 0;
    const updated = { ...current };

    for (const section of sections) {
        const existing = updated[section];
        const isEmpty = !existing || String(existing).trim().length < 10;
        const isAggressive = cfg.healingIntensity === 'aggressive';
        const isMinimal = cfg.healingIntensity === 'minimal';

        // Minimal mode: only fill empty sections
        // Moderate mode: fill empty + short sections
        // Aggressive mode: refresh all sections
        const needsHeal =
            isEmpty ||
            (!isMinimal && String(existing).trim().length < 30) ||
            isAggressive;

        if (!needsHeal) continue;

        const sectionLabel = section.replace(/_/g, ' ');
        const pageLabel = page.charAt(0).toUpperCase() + page.slice(1);
        const instruction = isEmpty
            ? `Generate professional, concise "${sectionLabel}" content for the ${pageLabel} page of Bluecoderhub, a premium software development company in Chennai, India. Brand voice: confident, innovative, human. Return only the content, no explanation.`
            : `Improve this "${sectionLabel}" for Bluecoderhub's ${pageLabel} page. Make it more compelling and professional. Return only the improved text.`;
        const seedContent = isEmpty ? `${sectionLabel} for ${pageLabel} page` : existing;

        try {
            const result = await modifyContent(instruction, seedContent);
            if (result && result.trim().length > 5) {
                updated[section] = result.trim();
                healedCount++;
                _addLog(
                    'content_update',
                    `Auto-updated "${page}/${section}"`,
                    'success',
                    { page, section, preview: result.substring(0, 120) }
                );
            }
        } catch (err) {
            // AI unavailable (no key / rate limited) — skip silently
            if (import.meta.env.DEV) {
                console.warn('[SelfHealing] AI unavailable for', page, section, err.message);
            }
        }
    }

    if (healedCount > 0) {
        // Note: Not persisting to localStorage since pages read from static content
        // Content healing logs are still tracked for audit purposes
        }

        return healedCount;
}

// ─── Main Healing Cycle ────────────────────────────────────────────────────

export async function runHealingCycle(force = false) {
    if (_running) return { skipped: true, reason: 'cycle_in_progress' };
    if (!isSelfHealingEnabled() && !force) return { skipped: true, reason: 'disabled' };

    _running = true;
    _addLog('system', 'Healing cycle started', 'info');

    let totalHealed = 0;

    try {
        const cfg = getSelfHealingConfig();

        // Step 1 — Data integrity
        if (cfg.autoRepairData) {
            totalHealed += await _repairDataIntegrity();
        }

        // Step 2 — Content refresh
        if (cfg.autoRefreshContent) {
            for (const page of cfg.targetPages) {
                const sections = cfg.contentSections[page] || [];
                if (sections.length > 0) {
                    totalHealed += await _healPage(page, sections);
                }
            }
        }

        // Step 3 — Recalculate health
        const health = calculateHealthScore();

        // Step 4 — Timestamp
        try { localStorage.setItem(KEYS.LAST_HEAL, new Date().toISOString()); } catch { /* ignore */ }

        _addLog(
            'system',
            `Cycle complete — ${totalHealed} item(s) healed. Health: ${health.overall}% (${health.status})`,
            'success',
            { health }
        );

        _notify();
        return { totalHealed, health };

    } catch (err) {
        _addLog('system', `Healing cycle error: ${err.message}`, 'error');
        return { error: err.message };
    } finally {
        _running = false;
    }
}

// ─── Scheduler ─────────────────────────────────────────────────────────────

export function startHealingCycle() {
    if (_timer) clearInterval(_timer);

    const cfg = getSelfHealingConfig();
    const intervalMs = (cfg.interval || 30) * 60 * 1000;

    // First run after 8 seconds (let the app finish loading)
    setTimeout(() => {
        if (isSelfHealingEnabled()) runHealingCycle();
    }, 8000);

    _timer = setInterval(() => {
        if (isSelfHealingEnabled()) runHealingCycle();
    }, intervalMs);

    _addLog('system', `Scheduler started — interval: ${cfg.interval} min`, 'info');
}

export function stopHealingCycle() {
    if (_timer) {
        clearInterval(_timer);
        _timer = null;
    }
}

export function isHealingRunning() {
    return _running;
}

// ─── Error Recovery ────────────────────────────────────────────────────────

/**
 * Called by ErrorBoundary to log component crashes.
 */
export function recordComponentError(errorId, componentName, errorMessage) {
    _addLog(
        'error_recovery',
        `Component crash [${componentName}]: ${String(errorMessage).substring(0, 120)}`,
        'error',
        { errorId, component: componentName }
    );
}

/**
 * Attempt to restore page content from the latest snapshot after a crash.
 */
export function attemptErrorRecovery(page) {
    const snapshots = getContentSnapshots();
    const snaps = snapshots[page] || [];
    if (snaps.length === 0) return false;

    try {
        const content = JSON.parse(snaps[0].content);
        _set(PAGE_KEY(page), content);
        _addLog('error_recovery', `Auto-restored "${page}" from latest snapshot`, 'success');
        _notify();
        return true;
    } catch {
        return false;
    }
}

// ─── Initialization ────────────────────────────────────────────────────────

/**
 * Call once at app startup (App.jsx useEffect).
 * Boots the scheduler if self-healing is enabled.
 */
export function initSelfHealing() {
    if (isSelfHealingEnabled()) {
        startHealingCycle();
    } else {
        _addLog('system', 'Self-healing is paused (was disabled by admin)', 'warning');
    }
}

// ─── Default export ────────────────────────────────────────────────────────

export default {
    initSelfHealing,
    isSelfHealingEnabled,
    setSelfHealingEnabled,
    isHealingRunning,
    getSelfHealingConfig,
    saveSelfHealingConfig,
    getHealingLog,
    clearHealingLog,
    getContentSnapshots,
    takeContentSnapshot,
    restoreFromSnapshot,
    calculateHealthScore,
    getHealthHistory,
    getLastHealTime,
    runHealingCycle,
    startHealingCycle,
    stopHealingCycle,
    recordComponentError,
    attemptErrorRecovery,
    subscribe,
    DEFAULT_CONFIG,
};
