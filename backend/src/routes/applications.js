import { Router } from 'express';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { writeLimiter } from '../middleware/rateLimits.js';
import { validate } from '../utils/validate.js';
import { HttpError } from '../utils/errors.js';

const router = Router();

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function validateIdParam(id) {
  if (!UUID_REGEX.test(id)) {
    throw new HttpError(400, 'Invalid ID', 'validation_error');
  }
  return id;
}

const applicationSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(254).transform((v) => v.toLowerCase()),
  phone: z.string().trim().max(40).optional().or(z.literal('')),
  position: z.string().trim().min(2).max(120),
  portfolioUrl: z.string().url().max(500).optional().or(z.literal('')),
  coverLetter: z.string().trim().min(20).max(5000)
});

const statusSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'rejected', 'accepted'])
});

router.post('/', writeLimiter, validate(applicationSchema), async (req, res, next) => {
  try {
    const data = req.validated.body;
    const result = await query(
      `INSERT INTO applications (name, email, phone, position, portfolio_url, cover_letter)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, email, phone, position, portfolio_url, cover_letter, status, created_at, updated_at`,
      [
        data.name,
        data.email,
        data.phone || null,
        data.position,
        data.portfolioUrl || null,
        data.coverLetter
      ]
    );
    res.status(201).json({ application: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

router.get('/', authenticate, requireRole('admin'), async (_req, res, next) => {
  try {
    const result = await query(
      `SELECT id, name, email, phone, position, portfolio_url, cover_letter, status, created_at, updated_at
       FROM applications
       ORDER BY created_at DESC`
    );
    res.json({ applications: result.rows });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/status', authenticate, requireRole('admin'), writeLimiter, validate(statusSchema), async (req, res, next) => {
  try {
    const validatedId = validateIdParam(req.params.id);
    const result = await query(
      `UPDATE applications SET status = $1, updated_at = NOW()
       WHERE id = $2
       RETURNING id, name, email, phone, position, portfolio_url, cover_letter, status, created_at, updated_at`,
      [req.validated.body.status, validatedId]
    );
    if (result.rowCount !== 1) throw new HttpError(404, 'Application not found', 'not_found');
    res.json({ application: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
