import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimits.js';
import { validate, slugify } from '../utils/validate.js';
import { HttpError } from '../utils/errors.js';

const router = Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function validateIdOrSlug(idOrSlug) {
  const isUuid = UUID_REGEX.test(idOrSlug);
  const isSlug = SLUG_REGEX.test(idOrSlug) && idOrSlug.length <= 100;
  if (!isUuid && !isSlug) {
    throw new HttpError(400, 'Invalid blog identifier', 'validation_error');
  }
  return isUuid ? { type: 'uuid', value: idOrSlug } : { type: 'slug', value: idOrSlug };
}

function validateIdParam(id) {
  if (!UUID_REGEX.test(id)) {
    throw new HttpError(400, 'Invalid blog ID', 'validation_error');
  }
  return id;
}

const blogSchema = z.object({
  title: z.string().trim().min(3).max(180),
  slug: z.string().trim().max(100).optional(),
  category: z.string().trim().min(2).max(80),
  author: z.string().trim().min(2).max(120),
  excerpt: z.string().trim().min(10).max(500),
  content: z.string().trim().min(20).max(50000),
  tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
  published: z.boolean().default(true)
});

router.get('/', async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT id, slug, title, category, author, excerpt, content, tags, published, created_at, updated_at
       FROM blog_posts
       WHERE published = true
       ORDER BY created_at DESC`
    );
    res.json({ blogs: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/admin', authenticate, requireRole('admin'), async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT id, slug, title, category, author, excerpt, content, tags, published, created_at, updated_at
       FROM blog_posts
       ORDER BY created_at DESC`
    );
    res.json({ blogs: result.rows });
  } catch (err) {
    next(err);
  }
});

router.get('/:idOrSlug', async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const validated = validateIdOrSlug(idOrSlug);
    
    let result;
    if (validated.type === 'uuid') {
      result = await query(
        `SELECT id, slug, title, category, author, excerpt, content, tags, published, created_at, updated_at
         FROM blog_posts
         WHERE published = true AND id = $1`,
        [validated.value]
      );
    } else {
      result = await query(
        `SELECT id, slug, title, category, author, excerpt, content, tags, published, created_at, updated_at
         FROM blog_posts
         WHERE published = true AND slug = $1`,
        [validated.value]
      );
    }
    if (result.rowCount !== 1) throw new HttpError(404, 'Blog post not found', 'not_found');
    res.json({ blog: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.post('/', authenticate, requireRole('admin'), writeLimiter, validate(blogSchema), async (req, res, next) => {
  try {
    const data = req.validated.body;
    const slug = slugify(data.slug || data.title);
    if (!slug) throw new HttpError(400, 'A valid slug is required', 'validation_error');

    const result = await query(
      `INSERT INTO blog_posts (slug, title, category, author, excerpt, content, tags, published, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id, slug, title, category, author, excerpt, content, tags, published, created_at, updated_at`,
      [slug, data.title, data.category, data.author, data.excerpt, data.content, data.tags, data.published, req.user.id]
    );
    res.status(201).json({ blog: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') next(new HttpError(409, 'Blog slug already exists', 'duplicate_slug'));
    else next(err);
  }
});

router.put('/:id', authenticate, requireRole('admin'), writeLimiter, validate(blogSchema), async (req, res, next) => {
  try {
    const data = req.validated.body;
    const slug = slugify(data.slug || data.title);
    const validatedId = validateIdParam(req.params.id);
    const result = await query(
      `UPDATE blog_posts
       SET slug = $1, title = $2, category = $3, author = $4, excerpt = $5, content = $6,
           tags = $7, published = $8, updated_at = NOW()
       WHERE id = $9
       RETURNING id, slug, title, category, author, excerpt, content, tags, published, created_at, updated_at`,
      [slug, data.title, data.category, data.author, data.excerpt, data.content, data.tags, data.published, validatedId]
    );
    if (result.rowCount !== 1) throw new HttpError(404, 'Blog post not found', 'not_found');
    res.json({ blog: result.rows[0] });
  } catch (err) {
    if (err.code === '23505') next(new HttpError(409, 'Blog slug already exists', 'duplicate_slug'));
    else next(err);
  }
});

router.delete('/:id', authenticate, requireRole('admin'), writeLimiter, async (req, res, next) => {
  try {
    const validatedId = validateIdParam(req.params.id);
    const result = await query('DELETE FROM blog_posts WHERE id = $1 RETURNING id', [validatedId]);
    if (result.rowCount !== 1) throw new HttpError(404, 'Blog post not found', 'not_found');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
