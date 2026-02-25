# Security Posture — Bluecoderhub

This document outlines the security measures implemented to protect the Bluecoderhub website and its users.

## 1. Network & Header Security
- **Strict Content Security Policy (CSP)**: Prevents Cross-Site Scripting (XSS) and data injection attacks by restricting resource loading to trusted origins.
- **X-Frame-Options: DENY**: Protects against Clickjacking by preventing the site from being embedded in frames.
- **X-Content-Type-Options: nosniff**: Prevents browsers from MIME-sniffing the response away from the declared content-type.
- **Referrer-Policy**: Set to `strict-origin-when-cross-origin` to prevent sensitive data leakage in referrer headers.
- **Permissions-Policy**: Restricts access to sensitive browser features (camera, microphone, geolocation).

## 2. Authentication & Session Management
- **SHA-256 Hashing**: Admin passwords are never stored in plain text. We use the Web Crypto API for secure client-side hashing.
- **Constant-Time Comparison**: Password verification logic includes timing-attack protections.
- **Secure Sessions**: 
  - Sessions are hosted in `sessionStorage` (cleared when the tab is closed).
  - Tokens are generated using `crypto.randomUUID()`.
  - Inactivity timeouts (30 minutes) automatically clear stale sessions.
- **Brute-Force Protection**: Client-side rate limiting and progressive lockouts for the Admin login.

## 3. Build & Dependency Security
- **Hardened Build Configuration**: 
  - Production source maps are disabled to prevent source code exposure.
  - Development headers mirror production security settings.
- **Dependency Auditing**: Regular `npm audit` scans are performed to identify and remediate vulnerable packages.

## 4. Offensive Defense
- **Honeypot Fields**: Hidden fields in forms to detect and block automated bot submissions.
- **Input Neutralization**: The application avoids `dangerouslySetInnerHTML` and relies on React's built-in XSS protections for all dynamic content.

## 5. Deployment Best Practices
- **HTTPS Enforcement**: The `upgrade-insecure-requests` directive ensures all traffic is encrypted.
- **Production Isolation**: Sensitive configurations are managed via environment variables and never committed to version control.
