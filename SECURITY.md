# Security Posture - Bluecoderhub

This project uses a server-authoritative security model. Client code may cache a bearer token for convenience, but authorization decisions happen in the backend.

## Authentication

- Admin users are stored in PostgreSQL in the `users` table.
- Passwords are hashed with bcrypt before storage.
- Login is handled by `POST /api/auth/login`.
- Authenticated requests use a JWT bearer token.
- Admin-only routes require both a valid token and the `admin` role.

## Data Storage

- Persistent application data is stored in PostgreSQL.
- The frontend does not use localStorage for CMS, applications, subscribers, or blog data.
- Database schema and indexes are defined in `backend/src/db/schema.sql`.

## API Protection

- Server-side validation uses Zod for all write endpoints.
- Express rate limiters protect authentication and write routes.
- Helmet sets security headers.
- CORS is restricted through `ALLOWED_ORIGINS`.

## Deployment

- Vercel deploys `api/[...path].js` as the serverless API entry.
- Docker runs the Express server and serves the built frontend from `frontend/dist`.

## Required Production Environment Variables

- `DATABASE_URL`
- `JWT_SECRET`
- `ALLOWED_ORIGINS`

Admin provisioning is explicit:

```bash
ADMIN_EMAIL=admin@example.com ADMIN_PASSWORD='replace-with-strong-password' npm run admin:create
```
