/**
 * LocalStorage CMS Storage Utility — Hardened
 * - MAX_ITEMS guard prevents unbounded growth
 * - DATA_EXPIRY_DAYS auto-prunes stale entries  
 * - Unified API with no duplicate functions
 */

import { STORAGE_PREFIX, MAX_APPLICATIONS_STORED, MAX_SUBSCRIBERS_STORED, DATA_EXPIRY_DAYS } from '../config/constants.js';

const PREFIX = STORAGE_PREFIX;
const EXPIRY_MS = DATA_EXPIRY_DAYS * 24 * 60 * 60 * 1000;

// ─── Core Primitives ──────────────────────────────────────────────────

export function saveToStorage(key, data) {
    try {
        const existing = getFromStorage(key) || [];
        const updated = Array.isArray(existing)
            ? [...existing.filter(item => item.id !== data.id),
            { ...data, id: data.id || Date.now().toString() }]
            : data;
        localStorage.setItem(PREFIX + key, JSON.stringify(updated));
        return true;
    } catch (e) {
        console.error('[Storage] Save error:', e);
        return false;
    }
}

export function getFromStorage(key) {
    try {
        const raw = localStorage.getItem(PREFIX + key);
        return raw ? JSON.parse(raw) : null;
    } catch {
        return null;
    }
}

export function deleteFromStorage(key, id) {
    try {
        const existing = getFromStorage(key) || [];
        const updated = Array.isArray(existing)
            ? existing.filter(item => item.id !== id)
            : null;
        if (updated !== null) {
            localStorage.setItem(PREFIX + key, JSON.stringify(updated));
        } else {
            localStorage.removeItem(PREFIX + key);
        }
        return true;
    } catch {
        return false;
    }
}

export function clearStorage(key) {
    localStorage.removeItem(PREFIX + key);
}

// ─── Expiry pruning ───────────────────────────────────────────────────

function pruneExpired(items) {
    if (!Array.isArray(items)) return items;
    const cutoff = Date.now() - EXPIRY_MS;
    return items.filter(item => {
        const ts = item.timestamp || item.submittedAt
            ? new Date(item.submittedAt || item.timestamp).getTime()
            : Date.now();
        return ts > cutoff;
    });
}

// ─── Page Content ─────────────────────────────────────────────────────

export function getPageContent(page) {
    return getFromStorage(`page_${page}`) || {};
}

/**
 * Save a single section within a page's content object.
 */
export function savePageSection(page, section, value) {
    const existing = getPageContent(page);
    existing[section] = value;
    localStorage.setItem(PREFIX + `page_${page}`, JSON.stringify(existing));
}

/** Alias for backward compat */
export const savePageContent = savePageSection;

export function getAllPageContent() {
    const result = {};
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(PREFIX + 'page_')) {
            const pageName = key.replace(PREFIX + 'page_', '');
            try {
                result[pageName] = JSON.parse(localStorage.getItem(key));
            } catch { /* skip corrupt entries */ }
        }
    }
    return result;
}

// ─── Images ───────────────────────────────────────────────────────────

export function saveImage(imageData) {
    const images = getFromStorage('images') || [];
    const newImage = { ...imageData, id: Date.now().toString(), timestamp: Date.now() };
    images.push(newImage);
    localStorage.setItem(PREFIX + 'images', JSON.stringify(images));
    return newImage;
}

export function getImages() {
    return getFromStorage('images') || [];
}

export function deleteImage(id) {
    return deleteFromStorage('images', id);
}

// ─── Text Files ───────────────────────────────────────────────────────

export function saveTextFile(fileData) {
    const files = getFromStorage('textFiles') || [];
    const existing = files.findIndex(f => f.name === fileData.name);
    if (existing >= 0) {
        files[existing] = { ...fileData, id: files[existing].id, timestamp: Date.now() };
    } else {
        files.push({ ...fileData, id: Date.now().toString(), timestamp: Date.now() });
    }
    localStorage.setItem(PREFIX + 'textFiles', JSON.stringify(files));
}

export function getTextFiles() {
    return getFromStorage('textFiles') || [];
}

export function deleteTextFile(id) {
    return deleteFromStorage('textFiles', id);
}

// ─── Job Applications ─────────────────────────────────────────────────

export function saveApplication(applicationData) {
    const existing = getApplications();
    if (existing.length >= MAX_APPLICATIONS_STORED) {
        console.warn('[Storage] Applications limit reached — pruning oldest entries.');
        // Remove oldest 10%
        const pruned = existing.slice(Math.floor(MAX_APPLICATIONS_STORED * 0.1));
        localStorage.setItem(PREFIX + 'applications', JSON.stringify(pruned));
    }
    return saveToStorage('applications', {
        ...applicationData,
        id: Date.now().toString(),
        status: 'pending',
        submittedAt: new Date().toISOString(),
    });
}

export function getApplications() {
    const all = getFromStorage('applications') || [];
    return pruneExpired(all);
}

// ─── Newsletter Subscribers ───────────────────────────────────────────

export function addSubscriber(email) {
    if (!email) return false;
    const normalizedEmail = String(email).toLowerCase().trim();
    const subscribers = getSubscribers();

    if (subscribers.length >= MAX_SUBSCRIBERS_STORED) {
        console.warn('[Storage] Subscribers limit reached.');
        return false;
    }

    const already = subscribers.find(s => (s.email || s) === normalizedEmail);
    if (!already) {
        subscribers.push({ email: normalizedEmail, date: new Date().toISOString() });
        localStorage.setItem(PREFIX + 'subscribers', JSON.stringify(subscribers));
    }
    return true;
}

export function getSubscribers() {
    return getFromStorage('subscribers') || [];
}

// ─── Convenience namespace object ─────────────────────────────────────

export const storage = {
    save: saveToStorage,
    get: getFromStorage,
    delete: deleteFromStorage,
    clear: clearStorage,
    savePageSection,
    savePageContent,
    getPageContent,
    getAllPageContent,
    saveImage,
    getImages,
    deleteImage,
    saveTextFile,
    getTextFiles,
    deleteTextFile,
    saveApplication,
    getApplications,
    addSubscriber,
    getSubscribers,
};
