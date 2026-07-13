# Symbio Architecture Blueprint & Strategy

## 1. Product Vision
**Symbio** is the collaborative workspace for modern organizations. It provides secure, isolated environments for teams to manage projects, assign tasks, share files, and communicate in real time. Symbio aims to consolidate fragmented workflows into a single, intuitive platform, prioritizing data isolation, performance, and a premium user experience.

## 2. Product Requirements Document (PRD)
**Target Audience**: Startups, SMBs, and Enterprise teams needing isolated and secure project management and communication.
**Key Value Propositions**:
- Complete data isolation per organization (Multi-tenancy).
- Real-time collaboration without context switching.
- Comprehensive oversight with analytics and audit logs.
**Success Metrics**:
- User Adoption (Daily/Weekly Active Users).
- Task Completion Rate.
- Minimal latency for real-time features (<100ms).

## 3. Software Requirements Specification (SRS)
**Functional Requirements**:
- User authentication and authorization (JWT & Refresh Tokens).
- Organization/Tenant management and isolation.
- Role-Based Access Control (RBAC): Admin, Manager, Member, Viewer.
- Project & Task CRUD operations.
- Real-time notifications and messaging.
- File upload and asset management via Cloudinary.
- Audit logging for all mutating actions.
**Non-Functional Requirements**:
- **Security**: Strict tenant data isolation. HTTPS everywhere. Encrypted sensitive fields.
- **Performance**: Edge caching where possible. Database query optimization via Prisma.
- **Scalability**: Stateless backend capable of horizontal scaling.
- **Usability**: Responsive design, Dark Mode, accessible components (shadcn/ui).

## 4. User Personas
- **Alice (The Admin)**: IT manager or founder. Cares about billing, user onboarding, role assignments, and security/audit logs.
- **Bob (The Manager)**: Project leader. Needs to create projects, assign tasks, monitor progress, and review analytics.
- **Charlie (The Member)**: Individual contributor. Needs clear task descriptions, file sharing, and real-time collaboration tools.
- **Diana (The Viewer)**: Stakeholder or client. Needs read-only access to specific project dashboards and task statuses.

## 5. User Stories
- *As an Admin, I want to invite users to my organization and assign them roles so that they can access the platform securely.*
- *As a Manager, I want to create a new project and assign tasks to members so that we can track our deliverables.*
- *As a Member, I want to receive real-time notifications when I am mentioned or assigned a task so that I don't miss important updates.*
- *As a Member, I want to upload files to a task so that my team can review my work.*
- *As an Admin, I want to view an audit log of all activities so that I can maintain compliance and security.*

## 6. Feature Breakdown
- **Authentication Module**: Login, Registration, Password Reset, JWT Management.
- **Organization Module**: Tenant setup, Member invitations, RBAC management.
- **Project & Task Module**: Kanban/List views, drag-and-drop, task assignments, due dates, status tracking.
- **Collaboration Module**: Comments, File attachments, Real-time status updates via WebSockets.
- **Analytics & Dashboard**: Org-wide overview, Project progress charts (Recharts), Activity heatmaps.
- **Settings & Profile**: User preferences (Dark Mode), Notification settings, Avatar upload.

## 7. Information Architecture
- `/` (Landing Page)
- `/auth/login` | `/auth/register`
- `/[orgId]/dashboard` (Organization Overview)
- `/[orgId]/projects` (List of Projects)
- `/[orgId]/projects/[projectId]` (Project Details & Kanban)
- `/[orgId]/tasks` (My Tasks)
- `/[orgId]/members` (Directory & Invites)
- `/[orgId]/settings` (Org Settings & Audit Logs)
- `/profile` (User Settings)

## 8. High-Level System Architecture
- **Client (Frontend)**: Next.js 15 (App Router). Fetches data via TanStack Query and Server Actions. Subscribes to Socket.IO events for real-time updates.
- **API Server (Backend)**: Node.js + Express. Exposes RESTful endpoints. Middleware for auth, tenant resolution, and RBAC validation.
- **Real-time Server**: Socket.IO integrated with the Express server (or microservice). Emits events (e.g., `task.updated`, `notification.new`) to authenticated, tenant-scoped rooms.
- **Database**: PostgreSQL hosted on Neon. Accessed via Prisma ORM.
- **Storage**: Cloudinary for avatars and file attachments.

## 9. Module Breakdown
**Frontend Modules**:
- `auth`: Forms, validation (Zod + React Hook Form), tokens.
- `layout`: Navigation, Sidebars, Theme toggling.
- `projects`: Boards, lists, creation dialogs.
- `tasks`: Task cards, detail modals, comments section.
- `realtime`: Socket context providers and custom hooks.

**Backend Modules**:
- `controllers`: Request handling and response formatting.
- `services`: Core business logic and database interactions.
- `middlewares`: `authenticateUser`, `requireRole`, `resolveTenant`.
- `sockets`: Event listeners and emitters.
- `utils`: Error handling, logger, Cloudinary wrapper.

## 10. Database Design (Conceptual)
- **User**: `id`, `email`, `passwordHash`, `name`, `avatarUrl`, `createdAt`
- **Organization**: `id`, `name`, `createdAt`
- **OrgMember**: `id`, `userId`, `orgId`, `role`, `joinedAt` (Join table enforcing tenancy & RBAC)
- **Project**: `id`, `orgId`, `name`, `description`, `createdAt`
- **Task**: `id`, `projectId`, `orgId`, `title`, `status`, `assigneeId`, `dueDate`, `createdAt`
- **Comment**: `id`, `taskId`, `userId`, `content`, `createdAt`
- **Attachment**: `id`, `taskId`, `uploaderId`, `fileUrl`, `fileType`, `createdAt`
- **AuditLog**: `id`, `orgId`, `userId`, `action`, `entityType`, `entityId`, `details`, `createdAt`

## 11. API Design (High Level)
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`
- `GET /api/v1/orgs/:orgId`
- `POST /api/v1/orgs/:orgId/members/invite`
- `GET /api/v1/orgs/:orgId/projects`
- `POST /api/v1/orgs/:orgId/projects`
- `GET /api/v1/projects/:projectId/tasks`
- `POST /api/v1/tasks/:taskId/comments`
- `POST /api/v1/upload` (Returns Cloudinary URL)

## 12. Folder Structure Recommendation
```text
symbio/
├── frontend/                     # Next.js 15 Application
│   ├── src/
│   │   ├── app/                  # App Router (Pages & Layouts)
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui components
│   │   │   ├── shared/           # Reusable components
│   │   │   └── features/         # Domain-specific components
│   │   ├── hooks/                # Custom React hooks
│   │   ├── lib/                  # Utilities, Zod schemas, api configurations
│   │   ├── store/                # Global state (if necessary)
│   │   └── types/                # TypeScript interfaces
│   └── package.json
└── backend/                      # Node.js + Express Application
    ├── src/
    │   ├── config/               # Env vars, DB config, Cloudinary config
    │   ├── controllers/          # Route handlers
    │   ├── middlewares/          # Auth, Error handling, Tenant resolution
    │   ├── routes/               # Express route definitions
    │   ├── services/             # Business logic (Prisma queries)
    │   ├── sockets/              # Socket.IO event handlers
    │   ├── prisma/               # Schema and migrations
    │   └── app.ts                # App entry point
    └── package.json
```

## 13. Development Milestones
- **Milestone 1: Foundation (Weeks 1-2)**
  - Setup monorepo/folder structure.
  - Configure DB (Neon), Prisma, and CI/CD pipelines.
  - Implement Auth (JWT) and Tenant creation.
- **Milestone 2: Core Workflows (Weeks 3-5)**
  - Implement Projects, Tasks, and Member invitations.
  - Build frontend dashboards and forms.
- **Milestone 3: Real-Time & Files (Weeks 6-7)**
  - Integrate Socket.IO for live task updates and notifications.
  - Integrate Cloudinary for file attachments.
- **Milestone 4: Polish & Launch (Week 8)**
  - Implement Analytics & Audit Logs.
  - Finalize Dark Mode and responsive design.
  - Comprehensive testing and Vercel/Render deployment.

## 14. Risk Assessment
- **Data Leakage Across Tenants**: High severity. *Mitigation*: Enforce `orgId` filtering in Prisma queries universally and implement strict middleware checks.
- **WebSocket Scaling**: Medium severity. *Mitigation*: Design Socket.IO implementation to use Redis adapter from day one to allow horizontal scaling.
- **Token Expiry UX**: Low severity. *Mitigation*: Implement silent refresh tokens on the frontend to prevent abrupt logouts.
- **Database Connection Limits**: Medium severity. *Mitigation*: Use Neon's connection pooling to manage connections effectively in serverless environments.

## 15. Production Best Practices
- **Security**: Implement Rate Limiting, Helmet for HTTP headers, and strict CORS policies. Use `HttpOnly` cookies for refresh tokens.
- **Monitoring**: Integrate Sentry for error tracking on both frontend and backend.
- **Database**: Use Prisma migrations safely. Back up database regularly.
- **State Management**: Heavily rely on TanStack Query for server state caching; keep client state minimal.
- **Code Quality**: Enforce ESLint, Prettier, and Husky pre-commit hooks. Strictly type everything via TypeScript.
