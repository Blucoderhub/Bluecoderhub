/**
 * Vercel Serverless Function — Secure Anthropic API Proxy
 *
 * The ANTHROPIC_API_KEY lives only here (server-side, no VITE_ prefix).
 * It is NEVER sent to the browser or bundled into client JavaScript.
 *
 * Set ANTHROPIC_API_KEY in Vercel project settings → Environment Variables.
 */

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const ANTHROPIC_API_VERSION = '2023-06-01';
const AI_MODEL = 'claude-haiku-4-5-20251001';

const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 10; // requests per IP per window

// In-memory rate limit store (resets on cold start — sufficient for single-instance)
const rateLimitStore = new Map();

function checkRateLimit(ip) {
    const now = Date.now();
    let record = rateLimitStore.get(ip);
    if (!record || now > record.resetAt) {
        record = { count: 0, resetAt: now + RATE_LIMIT_WINDOW_MS };
        rateLimitStore.set(ip, record);
    }
    if (record.count >= RATE_LIMIT_MAX) {
        return { allowed: false, waitMs: record.resetAt - now };
    }
    record.count++;
    return { allowed: true };
}

const ALLOWED_ORIGINS = [
    'https://bluecoderhub.com',
    'https://www.bluecoderhub.com',
    // Allow localhost only in non-production
    ...(process.env.VERCEL_ENV !== 'production'
        ? ['http://localhost:5173', 'http://localhost:4173', 'http://localhost:3000']
        : []),
];

export default async function handler(req, res) {
    // CORS
    const origin = req.headers.origin || '';
    if (ALLOWED_ORIGINS.includes(origin)) {
        res.setHeader('Access-Control-Allow-Origin', origin);
        res.setHeader('Vary', 'Origin');
    }
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') return res.status(204).end();

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed.' });
    }

    // Server-side rate limiting by client IP
    const ip = ((req.headers['x-forwarded-for'] || '') + '').split(',')[0].trim()
        || req.socket?.remoteAddress
        || 'unknown';

    const { allowed, waitMs } = checkRateLimit(ip);
    if (!allowed) {
        const waitSecs = Math.ceil(waitMs / 1000);
        res.setHeader('Retry-After', String(waitSecs));
        return res.status(429).json({ error: `Too many requests. Please wait ${waitSecs} seconds.` });
    }

    if (!ANTHROPIC_API_KEY) {
        return res.status(503).json({ error: 'AI service is not configured.' });
    }

    const { messages, maxTokens } = req.body || {};

    // Validate input
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > 10) {
        return res.status(400).json({ error: 'Invalid request.' });
    }
    for (const msg of messages) {
        if (typeof msg.role !== 'string' || typeof msg.content !== 'string') {
            return res.status(400).json({ error: 'Invalid message format.' });
        }
        if (msg.content.length > 6000) {
            return res.status(400).json({ error: 'Message content too long.' });
        }
        if (!['user', 'assistant'].includes(msg.role)) {
            return res.status(400).json({ error: 'Invalid message role.' });
        }
    }

    const safeMaxTokens = Math.min(Math.max(Number(maxTokens) || 1000, 1), 2000);

    try {
        const upstream = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': ANTHROPIC_API_VERSION,
            },
            body: JSON.stringify({
                model: AI_MODEL,
                max_tokens: safeMaxTokens,
                messages,
            }),
        });

        if (!upstream.ok) {
            const errData = await upstream.json().catch(() => ({}));
            console.error('[AI Proxy] Anthropic error:', upstream.status, errData);
            return res.status(upstream.status >= 500 ? 502 : upstream.status)
                .json({ error: 'AI request failed. Please try again.' });
        }

        const data = await upstream.json();
        return res.status(200).json({ text: data.content[0].text });

    } catch (err) {
        console.error('[AI Proxy] Unexpected error:', err);
        return res.status(500).json({ error: 'Internal server error.' });
    }
}
