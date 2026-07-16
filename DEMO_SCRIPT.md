# Symbio Live Demonstration Script

**Target Duration:** 10–15 Minutes  
**Prerequisites:** Ensure the local backend, database, and frontend are running (`pnpm dev`). Have a secondary incognito window ready to demonstrate real-time updates.

---

## 1. Introduction (1 min)
*Start on the Login Page.*
- **Speaker:** "Welcome to Symbio, an enterprise-grade multi-tenant project management SaaS. Today, I'll demonstrate our core architectural achievements: robust RBAC, real-time Socket.IO collaboration, and secure file handling."

## 2. Registration & Email Verification (2 mins)
*Navigate to `/register`.*
- **Action:** Create a new user (`alice@symbio.com`).
- **Speaker:** "We intercept this request using Zod validation. The backend hashes the password using bcrypt and fires an asynchronous event to Resend."
- **Action:** *Show the terminal/logs or simulated inbox showing the Verification Email.* Click the link to verify.
- **Speaker:** "Once verified, we proceed to login."

## 3. Login & Authentication (1 min)
*Navigate to `/login`.*
- **Action:** Log in as Alice.
- **Speaker:** "Symbio issues a short-lived stateless JWT for API requests, and a long-lived `HttpOnly`, `Secure` refresh token cookie for session persistence, completely mitigating XSS vulnerabilities."

## 4. Organization & Workspace Creation (3 mins)
*Navigate to the Dashboard.*
- **Action:** Create a new Organization named "Acme Corp".
- **Speaker:** "Alice is now the `OWNER` of Acme Corp. Let's create a Workspace inside it called 'Engineering'."
- **Action:** Create Workspace "Engineering".
- **Speaker:** "The hierarchy is strict. If we were to invite another user as a Workspace Member, they would have zero visibility into the broader Organization settings. This is enforced by our centralized RBAC middleware."

## 5. Real-Time Collaboration & Uploads (4 mins)
*Open the 'Engineering' Workspace.*
- **Action:** Open an Incognito Window side-by-side, logged in as a secondary user (`bob@symbio.com`), also in the 'Engineering' workspace.
- **Speaker:** "Notice the 'Online' indicator. This is powered by Socket.IO with JWT authentication handshakes. Bob is actively in the room."
- **Action:** As Alice, upload an image via the Workspace UI.
- **Speaker:** "This file is streamed to Cloudinary. Watch Bob's screen."
- **Action:** The file instantly appears on Bob's screen without refreshing.
- **Speaker:** "The backend emitted a Socket.IO event scoped strictly to `workspace:{id}`. The frontend caught it, invalidated the React Query cache, and seamlessly fetched the new asset."

## 6. Enterprise Audit Logs & Analytics (2 mins)
*Navigate to the Organization Settings -> Audit Logs.*
- **Action:** Show the audit log table.
- **Speaker:** "Every significant action—logging in, creating the workspace, and uploading that file—has been immutably recorded by the `AuditService`. These logs are paginated and strictly guarded by the RBAC engine."
- *Navigate to `/dashboard`.*
- **Speaker:** "The Dashboard aggregates this data, showing active sessions, storage used, and total assets, driven by optimized Prisma queries."

## 7. Logout & Conclusion (1 min)
*Click Logout.*
- **Action:** The user is redirected to the login screen.
- **Speaker:** "Logging out successfully destroys the HttpOnly cookie and invalidates the session footprint. That concludes the core technical walkthrough of Symbio's foundation. Thank you."
