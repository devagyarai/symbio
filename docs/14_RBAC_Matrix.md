# Role-Based Access Control (RBAC) Matrix

## Overview
Symbio implements a strict Role-Based Access Control system to govern what users can do within a specific Organization (Tenant). A user's role is defined in the `OrgMember` join table.

## Roles Defined
1. **Admin:** Full control over the organization, including billing, overarching settings, and security audits.
2. **Manager:** Operational leaders who can create and manage projects, and oversee team workloads.
3. **Member:** Standard users who contribute to projects and execute tasks.
4. **Viewer:** Read-only users (e.g., clients, external stakeholders).

## Permissions Matrix

| Feature / Action | Admin | Manager | Member | Viewer |
| :--- | :---: | :---: | :---: | :---: |
| **Organization Management** | | | | |
| View Org Details | ✅ | ✅ | ✅ | ✅ |
| Edit Org Settings (Name, Billing) | ✅ | ❌ | ❌ | ❌ |
| View Audit Logs | ✅ | ❌ | ❌ | ❌ |
| Invite/Remove Users | ✅ | ✅ | ❌ | ❌ |
| Change User Roles | ✅ | ❌ | ❌ | ❌ |
| **Project Management** | | | | |
| View Projects | ✅ | ✅ | ✅ | ✅ |
| Create New Project | ✅ | ✅ | ❌ | ❌ |
| Edit/Delete Project | ✅ | ✅ | ❌ | ❌ |
| **Task Management** | | | | |
| View Tasks | ✅ | ✅ | ✅ | ✅ |
| Create Task | ✅ | ✅ | ✅ | ❌ |
| Edit Task Status/Assignee | ✅ | ✅ | ✅ | ❌ |
| Delete Task | ✅ | ✅ | ❌ | ❌ |
| **Collaboration** | | | | |
| View Comments/Files | ✅ | ✅ | ✅ | ✅ |
| Add Comments | ✅ | ✅ | ✅ | ❌ |
| Upload Files | ✅ | ✅ | ✅ | ❌ |
| Delete Own Comments | ✅ | ✅ | ✅ | ❌ |
| Delete Any Comment | ✅ | ✅ | ❌ | ❌ |

## Implementation Notes
- RBAC is enforced primarily on the backend via Express middleware (e.g., `requireRole(['ADMIN', 'MANAGER'])`).
- The frontend uses the user's role context to conditionally render UI elements (e.g., hiding the "Delete Project" button for Members).
