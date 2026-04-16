/**
 * Anthropic Claude API Integration
 *
 * Production: All calls go through /api/ai (Vercel serverless proxy).
 *   - API key stays server-side, never bundled into client JS.
 *   - Server enforces IP-based rate limiting.
 *
 * Development: Falls back to direct browser call if VITE_ANTHROPIC_API_KEY
 *   is set in .env.local (never commit this file).
 */

import { checkRateLimit, recordCall } from '../security/rateLimit.js';
import { sanitizeForPrompt } from '../security/sanitize.js';
import { AI_MODEL, ANTHROPIC_API_VERSION, MAX_AI_INPUT_LENGTH } from '../config/constants.js';

async function callClaude(messages, maxTokens = 1000) {
    // Client-side rate limit (UX guard — server enforces the hard limit)
    const { allowed, waitMs } = checkRateLimit('ai_call');
    if (!allowed) {
        const secs = Math.ceil(waitMs / 1000);
        throw new Error(`Too many AI requests. Please wait ${secs} second${secs !== 1 ? 's' : ''} and try again.`);
    }

    let response;

    if (import.meta.env.DEV && import.meta.env.VITE_ANTHROPIC_API_KEY) {
        // ── DEV ONLY: direct browser call with local key ──────────────────────
        // Set VITE_ANTHROPIC_API_KEY only in .env.local (git-ignored).
        // This code path is dead-code-eliminated in production builds.
        response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': import.meta.env.VITE_ANTHROPIC_API_KEY,
                'anthropic-version': ANTHROPIC_API_VERSION,
                'anthropic-dangerous-direct-browser-calls': 'true',
            },
            body: JSON.stringify({ model: AI_MODEL, max_tokens: maxTokens, messages }),
        });
    } else {
        // ── PRODUCTION: secure server-side proxy (api/ai.js) ─────────────────
        response = await fetch('/api/ai', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ messages, maxTokens }),
        });
    }

    recordCall('ai_call');

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        if (import.meta.env.DEV) {
            console.error('[AI] API error:', err);
        }
        throw new Error(err.error || 'AI request failed. Please try again.');
    }

    const data = await response.json();
    // Dev direct call returns Anthropic format; proxy returns { text }
    return import.meta.env.DEV && import.meta.env.VITE_ANTHROPIC_API_KEY
        ? data.content[0].text
        : data.text;
}

/**
 * Modify content based on natural language instruction.
 */
export async function modifyContent(instruction, currentContent) {
    const safeInstruction = sanitizeForPrompt(instruction, MAX_AI_INPUT_LENGTH);
    const safeContent = sanitizeForPrompt(currentContent, MAX_AI_INPUT_LENGTH);
    const messages = [
        {
            role: 'user',
            content: `You are a content editor for Bluecoderhub PVT LTD, a premium software company.

Current content: "${safeContent}"

Instruction: "${safeInstruction}"

Modify the content per the instruction. Return ONLY the modified content, no explanation, no quotes, no markdown.`,
        },
    ];
    return callClaude(messages, 500);
}

/**
 * Generate multiple content suggestions.
 */
export async function suggestImprovements(content, contentType = 'heading') {
    const safeContent = sanitizeForPrompt(content, MAX_AI_INPUT_LENGTH);
    const safeType = sanitizeForPrompt(contentType, 50);
    const messages = [
        {
            role: 'user',
            content: `You are a content strategist for Bluecoderhub PVT LTD, a premium software company.

Content type: ${safeType}
Current content: "${safeContent}"

Generate exactly 3 improved professional variations. Return ONLY a JSON array: ["suggestion 1", "suggestion 2", "suggestion 3"]`,
        },
    ];
    const result = await callClaude(messages, 400);
    try {
        const json = result.match(/\[[\s\S]*\]/)?.[0];
        return JSON.parse(json || result);
    } catch {
        return [result];
    }
}

/**
 * Generate blog post content.
 */
export async function generateBlogContent(title, keywords) {
    const safeTitle = sanitizeForPrompt(title, 200);
    const safeKeywords = Array.isArray(keywords)
        ? keywords.map(k => sanitizeForPrompt(k, 50)).slice(0, 10).join(', ')
        : 'technology, innovation';
    const messages = [
        {
            role: 'user',
            content: `Write a professional blog post intro (2-3 paragraphs) for Bluecoderhub's tech blog.
Title: "${safeTitle}"
Keywords: ${safeKeywords}
Return only the blog content.`,
        },
    ];
    return callClaude(messages, 600);
}

/**
 * Generate image alt text.
 */
export async function generateAltText(imageDescription) {
    const safeDesc = sanitizeForPrompt(imageDescription, 200);
    const messages = [
        {
            role: 'user',
            content: `Generate concise alt text (max 125 chars) for an image on Bluecoderhub's website.
Image context: "${safeDesc}"
Return only the alt text.`,
        },
    ];
    return callClaude(messages, 100);
}

/**
 * Analyze a feature request and suggest code changes.
 */
export async function analyzeCodeChange(instruction) {
    const safeInstruction = sanitizeForPrompt(instruction, MAX_AI_INPUT_LENGTH);
    const messages = [
        {
            role: 'user',
            content: `You are a senior React developer at Bluecoderhub. Analyze this feature request.
Request: "${safeInstruction}"
Return a JSON object: { "files": [], "summary": "", "changes": [], "warnings": [] }`,
        },
    ];
    const result = await callClaude(messages, 800);
    try {
        const json = result.match(/\{[\s\S]*\}/)?.[0];
        return JSON.parse(json || '{}');
    } catch {
        return { summary: result, files: [], changes: [], warnings: [] };
    }
}

/**
 * Improve a job description.
 */
export async function improveJobDescription(description) {
    const safeDesc = sanitizeForPrompt(description, MAX_AI_INPUT_LENGTH);
    const messages = [
        {
            role: 'user',
            content: `Improve this job description for Bluecoderhub PVT LTD to attract top talent.
Make it authentic, engaging, and highlight growth opportunities. 2-3 sentences max.
Original: "${safeDesc}"
Return only the improved description.`,
        },
    ];
    return callClaude(messages, 300);
}
