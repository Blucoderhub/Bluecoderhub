import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimits.js';
import { validate } from '../utils/validate.js';
import { HttpError } from '../utils/errors.js';

const router = Router();

const subscriberSchema = z.object({
  email: z.string().email().max(254).transform((v) => v.toLowerCase()),
  source: z.string().trim().min(2).max(80).default('footer')
});

router.post('/', writeLimiter, validate(subscriberSchema), async (req, res, next) => {
  try {
    const { email, source } = req.validated.body;
    const result = await query(
      `INSERT INTO subscribers (email, source)
       VALUES ($1, $2)
       ON CONFLICT (email) DO UPDATE SET source = EXCLUDED.source
       RETURNING id, email, source, created_at`,
      [email, source]
    );
    res.status(201).json({ subscriber: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, requireRole('admin'), async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT id, email, source, created_at
       FROM subscribers
       ORDER BY created_at DESC`
    );
    res.json({ subscribers: result.rows });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', authenticate, requireRole('admin'), writeLimiter, async (req, res, next) => {
  try {
    const result = await query('DELETE FROM subscribers WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rowCount !== 1) throw new HttpError(404, 'Subscriber not found', 'not_found');
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
