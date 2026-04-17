export class HttpError extends Error {
  constructor(status, message, code = 'error') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

export function notFound(req, _res, next) {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`, 'not_found'));
}

export function errorHandler(err, _req, res, _next) {
  const status = Number(err.status || 500);
  const safeStatus = status >= 400 && status < 600 ? status : 500;
  const payload = {
    error: safeStatus === 500 ? 'Internal server error' : err.message,
    code: err.code || 'error'
  };

  if (safeStatus >= 500) {
    console.error('[api:error]', err);
  }

  res.status(safeStatus).json(payload);
}
