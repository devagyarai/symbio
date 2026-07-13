# Database Architecture

## Overview
Symbio uses a relational database model implemented in **PostgreSQL** (hosted on Neon) and managed via **Prisma ORM**. The design rigorously enforces multi-tenancy by including an `orgId` on almost every operational table.

## Core Entities

### User
Represents a global platform user.
- `id` (UUID)
- `email` (String, Unique)
- `passwordHash` (String)
- `name` (String)
- `avatarUrl` (String, Optional)
- `createdAt` (DateTime)

### Organization (Tenant)
Represents the tenant workspace.
- `id` (UUID)
- `name` (String)
- `createdAt` (DateTime)

### OrgMember
Join table linking Users to Organizations and defining their role.
- `id` (UUID)
- `userId` (UUID, FK to User)
- `orgId` (UUID, FK to Organization)
- `role` (Enum: ADMIN, MANAGER, MEMBER, VIEWER)
- `joinedAt` (DateTime)

### Project
A collection of tasks within an organization.
- `id` (UUID)
- `orgId` (UUID, FK to Organization)
- `name` (String)
- `description` (String, Optional)
- `createdAt` (DateTime)

### Task
An actionable item within a project.
- `id` (UUID)
- `projectId` (UUID, FK to Project)
- `orgId` (UUID, FK to Organization - for strict tenant scoping)
- `title` (String)
- `status` (String/Enum: TODO, IN_PROGRESS, DONE)
- `assigneeId` (UUID, FK to User, Optional)
- `dueDate` (DateTime, Optional)
- `createdAt` (DateTime)

### Comment
User-generated discussion on a task.
- `id` (UUID)
- `taskId` (UUID, FK to Task)
- `userId` (UUID, FK to User)
- `content` (Text)
- `createdAt` (DateTime)

### Attachment
Files uploaded to a task.
- `id` (UUID)
- `taskId` (UUID, FK to Task)
- `uploaderId` (UUID, FK to User)
- `fileUrl` (String - Cloudinary URL)
- `fileType` (String)
- `createdAt` (DateTime)

### AuditLog
Immutable record of actions for compliance.
- `id` (UUID)
- `orgId` (UUID, FK to Organization)
- `userId` (UUID, FK to User)
- `action` (String)
- `entityType` (String)
- `entityId` (UUID)
- `details` (JSON)
- `createdAt` (DateTime)
