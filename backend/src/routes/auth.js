import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { query } from '../db/pool.js';
import { signToken, authenticate } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimits.js';
import { validate } from '../utils/validate.js';
import { HttpError } from '../utils/errors.js';
import { env } from '../config/env.js';

const router = Router();

const DUMMY_HASH = '$2a$10$abcdefghijklmnopqrstuvwxyz12345678901234567890123456';

const loginSchema = z.object({
  email: z.string().email().max(254).transform((v) => v.toLowerCase()),
  password: z.string().min(1).max(256)
});

function createCookieOptions() {
  const isProduction = env.nodeEnv === 'production';
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 2 * 60 * 60 * 1000,
    path: '/'
  };
}

router.post('/login', authLimiter, validate(loginSchema), async (req, res, next) => {
  try {
    const { email, password } = req.validated.body;
    const result = await query(
      'SELECT id, email, password_hash, role FROM users WHERE email = $1',
      [email]
    );

    const user = result.rows[0];
    const passwordHash = user?.password_hash || DUMMY_HASH;
    const valid = await bcrypt.compare(password, passwordHash);
    
    if (!valid || !user) {
      throw new HttpError(401, 'Invalid credentials', 'invalid_credentials');
    }

    const token = signToken(user);
    
    res.cookie('auth_token', token, createCookieOptions());
    res.json({
      token,
      user: { id: user.id, email: user.email, role: user.role }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (_req, res) => {
  res.clearCookie('auth_token', { path: '/' });
  res.json({ ok: true });
});

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

export default router;