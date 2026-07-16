# Symbio System Architecture

This document describes the architectural layout and core flows of the Symbio SaaS Platform. 

---

## 1. High-Level Architecture

Symbio operates on a separated frontend-backend architecture inside a Turborepo. 

- **Client:** React (Next.js 15) Single Page Application interacting with the API via REST and WebSockets.
- **Server:** Node.js (Express) providing stateless REST endpoints and stateful WebSocket rooms.
- **Database:** PostgreSQL (Neon Serverless) managed exclusively via Prisma ORM.
- **Third-Party Integrations:** Cloudinary for binary blobs; Resend for transactional email pipelines.

---

## 2. Frontend Architecture (Web)
Located in `apps/web/`.

- **Framework:** Next.js (App Router).
- **State Management:** 
  - `Zustand`: Ephemeral UI state (modals, auth presence).
  - `React Query`: Asynchronous server state, caching, and cache invalidation.
- **Styling:** Tailwind CSS + shadcn/ui component primitives.
- **Security:** `AuthGuard` wrappers for protected routes, strict Zod schemas for form submissions via `react-hook-form`.

---

## 3. Backend Architecture (API)
Located in `apps/api/`.

- **Design Pattern:** Modular MVC (Controller-Service pattern).
- **Validation Layer:** Centralized Zod schemas mapped to HTTP body/query using Express middleware.
- **Error Handling:** Centralized generic error interceptor catching standard `AppError` and `ZodError` instances, preventing stack trace leaks.
- **Security Middleware:** Helmet, CORS, Rate-Limiting.

---

## 4. Database Relationships

The database strictly enforces referential integrity through Prisma.

- **User**: Core identity. Contains multi-tenant memberships.
- **Organization**: The top-level tenant. 
- **Workspace**: A project-level container belonging to an Organization.
- **Membership Junctions**: `OrganizationMembership` and `WorkspaceMembership` contain roles specific to that scope.
- **Cascading Rules**: Deleting an Organization cascades and deletes all related Workspaces, Memberships, and File Assets. 

---

## 5. Core System Flows

### 🔐 Authentication Flow
1. Client submits credentials to `/auth/login`.
2. Server validates, compares bcrypt hash, and issues:
   - **Access Token (JWT)**: Short-lived (e.g., 15m), sent in the JSON body.
   - **Refresh Token**: Long-lived (e.g., 7d), saved to the DB and sent as an `HttpOnly`, `Secure`, `SameSite=None` cookie.
3. Client attaches Access Token to `Authorization: Bearer` headers.
4. When Access Token expires, Client calls `/auth/refresh` using the cookie to get a new Access Token.

### 🛡️ RBAC Flow
1. Auth middleware parses JWT to obtain `userId`.
2. Controller calls `PermissionService.verifyOrgRole()` or `verifyWorkspaceRole()`.
3. Service queries Prisma junction tables for `userId` + `targetId`.
4. If role weight is insufficient (e.g. `VIEWER` attempting `ADMIN` action), an `AuthorizationError` is thrown (HTTP 403).

### ⚡ Real-Time Socket.IO Flow
1. Client connects to `/` using standard WebSockets.
2. Connection provides Access Token in `socket.auth.token`.
3. Server verifies JWT. On success, assigns user to `socket.data.user`.
4. Client emits `join_workspace`, server securely places socket in `workspace:{id}` room.
5. REST mutations (e.g., File Upload) trigger `NotificationService` which emits `.to('workspace:{id}')`, updating clients instantly without polling.

### ☁️ File Upload Flow
1. Client selects a file and posts `multipart/form-data` to `/upload/image`.
2. Multer (memory storage) buffers the file.
3. File is piped securely to Cloudinary.
4. Cloudinary returns a secure URL.
5. Server creates a `FileAsset` row in Prisma, mapping the Cloudinary URL to the Workspace.

### 📊 Dashboard Flow
1. Client navigates to `/dashboard`.
2. `DashboardController` receives request.
3. `DashboardService` executes parallel Prisma aggregation queries (Count users, count active sessions, sum `FileAsset` size).
4. Results are serialized and cached in the client via React Query.
