import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { HttpError } from '../utils/errors.js';
import { query } from '../db/pool.js';

export function signToken(user) {
  if (!env.jwtSecret) {
    throw new Error('JWT_SECRET is required');
  }
  return jwt.sign(
    { sub: user.id, role: user.role, email: user.email },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn, issuer: 'bluecoderhub' }
  );
}

export async function authenticate(req, _res, next) {
  try {
    let token = null;

    const cookieToken = req.cookies?.auth_token;
    const headerToken = req.headers.authorization?.split(' ')[1];

    token = cookieToken || headerToken;

    if (!token) {
      throw new HttpError(401, 'Authentication required', 'auth_required');
    }

    const decoded = jwt.verify(token, env.jwtSecret, { issuer: 'bluecoderhub' });
    const result = await query(
      'SELECT id, email, role, created_at FROM users WHERE id = $1',
      [decoded.sub]
    );

    if (result.rowCount !== 1) {
      throw new HttpError(401, 'Invalid session', 'invalid_session');
    }

    req.user = result.rows[0];
    next();
  } catch (err) {
    if (err instanceof HttpError) {
      next(err);
      return;
    }
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      next(new HttpError(401, 'Invalid or expired token', 'invalid_token'));
      return;
    }
    next(new HttpError(401, 'Authentication failed', 'auth_failed'));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      next(new HttpError(403, 'Insufficient permissions', 'forbidden'));
      return;
    }
    next();
  };
}