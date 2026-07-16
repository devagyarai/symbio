# Symbio Project Walkthrough

This document serves as the official project walkthrough for the **ReadyNest Internship Evaluation**. It outlines the core problem, our architectural solution, module deep-dives, and future possibilities.

---

## 1. Problem Statement
Modern enterprise teams face a fragmented software ecosystem. While managing projects, they are forced to jump between disjointed tools for file management, real-time communication, and auditing. Furthermore, many existing platforms fail to provide the strict hierarchical multi-tenant access control (Organizations -> Workspaces) required by complex corporate environments.

## 2. Our Solution
**Symbio** is a centralized, multi-tenant SaaS platform that unifies organization management, real-time project collaboration, and secure file sharing. By providing a strict Role-Based Access Control (RBAC) engine natively integrated with immutable Audit Logging, Symbio offers enterprises total control over their data without sacrificing user experience.

---

## 3. Architecture Overview
Symbio is built as a **Turborepo** monorepo to ensure strict boundary enforcement between the frontend UX and backend business logic. 
- **Frontend**: Next.js 15 App Router providing static generation and client-side dynamic rendering (React Query, Zustand).
- **Backend**: Node.js Express API providing stateless REST endpoints.
- **Database**: PostgreSQL (Neon) using Prisma for robust relational guarantees.

*For detailed data flows, see [ARCHITECTURE.md](docs/ARCHITECTURE.md).*

---

## 4. Key Modules & Features

### A. Authentication & Identity
We designed a hyper-secure, stateless JWT implementation combined with stateful Refresh Tokens stored as `HttpOnly`, `Secure` cookies. This prevents XSS attacks from stealing long-lived session credentials. We integrated Resend to provide asynchronous email verification and password reset flows.

### B. Multi-Tenant Organization & Workspace Management
The platform utilizes a hierarchical tenant model. Users belong to Organizations. Organizations contain Workspaces. A user's privileges are scoped precisely to their junction table membership, meaning an Organization Owner can have elevated rights while only being a generic member of a specific Workspace.

### C. Real-Time Socket.IO Integration
To make the platform feel alive, we bypassed REST polling in favor of authenticated WebSockets. When a user uploads a file or updates a project status, the server emits a room-scoped event, and the frontend React Query cache is instantly invalidated and refreshed.

### D. Cloudinary Asset Management
Symbio supports robust binary file uploads. Our integration streams multipart form data safely to Cloudinary, linking the resulting secure URLs to the correct Workspace via Prisma `FileAsset` rows.

### E. Enterprise Audit Logging
Every mutation (Login, Create Workspace, Upload File) invokes the `AuditService`. These logs are immutable and can be retrieved by Organization Owners and Super Admins via the Dashboard to track compliance and monitor internal security.

---

## 5. Security Posture
- **Input Validation:** All incoming data is rigorously sanitized using Zod schemas. 
- **Error Obfuscation:** The global error handler traps exceptions. Operational validation errors return `422`, but all native runtime errors return generic `500`s to prevent leaking stack traces.
- **Rate Limiting & Headers:** Express Rate Limiting mitigates brute-force attacks, while Helmet sets strict Content Security Policies.

---

## 6. Challenges Faced
- **Cross-Origin Cookie Security:** Developing locally vs deploying to decoupled production domains (Vercel + Render) caused refresh cookies to be dropped. We solved this by conditionally configuring `SameSite=None` exclusively for production environments.
- **RBAC Complexity:** Ensuring that an Organization Owner inherently possessed Workspace Admin rights required writing sophisticated recursive permission checks within our middleware.

---

## 7. Future Scope
- **WebRTC Integration:** Upgrading our Socket.IO presence engine into full audio/video huddles for Workspace members.
- **Advanced Analytics:** Integrating a time-series database (like ClickHouse) to generate granular usage reports.
- **Third-Party Integrations:** Implementing OAuth2 providers (Google, GitHub) for single sign-on (SSO).
