# Information Architecture

## Application Sitemap
The following details the primary routes and page hierarchy within the Symbio application.

- **`/`** (Landing Page)
  - Public marketing site detailing features and value proposition.
- **`/auth`** (Authentication Flows)
  - `/auth/login`: User sign-in.
  - `/auth/register`: New user registration.
  - `/auth/forgot-password`: Password reset initiation.
- **`/[orgId]`** (Tenant-Specific Workspace)
  - **`/[orgId]/dashboard`**
    - Organization overview, activity heatmaps, and quick stats.
  - **`/[orgId]/projects`**
    - List of all projects within the organization.
    - **`/[orgId]/projects/[projectId]`**
      - Project Details, including Kanban and List views.
  - **`/[orgId]/tasks`**
    - "My Tasks" view aggregating assigned tasks across all projects.
  - **`/[orgId]/members`**
    - Directory of organization members and invite management interface.
  - **`/[orgId]/settings`**
    - Organization Settings (Admins only).
    - Audit Logs (Admins only).
- **`/profile`** (User Context)
  - User Settings, theme preferences, and avatar upload.
