# Security Architecture

## Overview
Security is a foundational pillar of Symbio. As a multi-tenant platform, preventing data leakage across organizations is our highest priority.

## Multi-Tenancy & Data Isolation
- **Database Level:** Almost every operational table includes an `orgId` column.
- **Query Level:** Prisma queries are wrapped in service layers that universally mandate `orgId` as a filter parameter. 
- **Middleware Level:** The `resolveTenant` Express middleware intercepts requests, verifies the user's membership in the requested `orgId`, and attaches the tenant context to the request object.

## Authentication & Session Management
- **JWT:** Short-lived JSON Web Tokens (e.g., 15 minutes) are used for API authorization.
- **Refresh Tokens:** Long-lived tokens stored securely in `HttpOnly`, `Secure`, `SameSite=Strict` cookies to prevent token theft via XSS.
- **Password Hashing:** Passwords are mathematically hashed and salted using robust algorithms (e.g., bcrypt/argon2) before database insertion.

## Network & Application Security
- **HTTPS Enforcement:** All traffic must be encrypted via TLS/SSL.
- **HTTP Headers:** Implementation of Helmet.js to set secure HTTP headers (e.g., CSP, X-Frame-Options).
- **CORS:** Strict Cross-Origin Resource Sharing policies allowing only the designated Next.js frontend domains.
- **Rate Limiting:** API endpoints (especially `/auth`) are protected by rate limiters to prevent brute-force and DDoS attacks.

## Audit & Compliance
- **Audit Logging:** Every mutating action (POST, PATCH, DELETE) is recorded in an immutable `AuditLog` table. This provides a clear trail of "who did what, and when" for organizational admins.
