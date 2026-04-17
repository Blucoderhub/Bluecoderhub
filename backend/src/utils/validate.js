import { ZodError } from 'zod';
import { HttpError } from './errors.js';

export function validate(schema, source = 'body') {
  return (req, _res, next) => {
    try {
      req.validated = req.validated || {};
      req.validated[source] = schema.parse(req[source]);
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        next(new HttpError(400, 'Invalid request payload', 'validation_error'));
        return;
      }
      next(err);
    }
  };
}

export function slugify(value) {
  return String(value)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}
