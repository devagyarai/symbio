# API Architecture

## Overview
Symbio exposes a RESTful API built with Node.js and Express. It is designed to be stateless, secure, and easily consumable by the Next.js frontend client.

## Base URL & Versioning
All API endpoints are versioned to ensure backward compatibility.
- **Base Path:** `/api/v1`

## Authentication & Authorization
The API uses JSON Web Tokens (JWT) for authentication.
- **Access Tokens:** Short-lived, passed in the `Authorization: Bearer <token>` header.
- **Refresh Tokens:** Long-lived, stored in secure, `HttpOnly` cookies to prevent XSS attacks.
- **Tenant Middleware:** All routes under a tenant context (e.g., `/orgs/:orgId/*`) require the user to have an active `OrgMember` record for that specific `orgId`.

## Core Endpoints

### Auth
- `POST /api/v1/auth/login`: Authenticate user and return tokens.
- `POST /api/v1/auth/register`: Register a new user.
- `POST /api/v1/auth/refresh`: Issue a new access token using the refresh cookie.

### Organizations
- `GET /api/v1/orgs/:orgId`: Retrieve organization details.
- `POST /api/v1/orgs/:orgId/members/invite`: Send an invitation to join the org.
- `GET /api/v1/orgs/:orgId/members`: List organization members.

### Projects & Tasks
- `GET /api/v1/orgs/:orgId/projects`: List projects for a tenant.
- `POST /api/v1/orgs/:orgId/projects`: Create a new project.
- `GET /api/v1/projects/:projectId/tasks`: Retrieve tasks for a specific project.
- `POST /api/v1/projects/:projectId/tasks`: Create a new task.
- `PATCH /api/v1/tasks/:taskId`: Update task status or details.

### Collaboration
- `POST /api/v1/tasks/:taskId/comments`: Add a comment to a task.
- `POST /api/v1/upload`: Upload an asset (returns a secure Cloudinary URL).

## Error Handling
The API returns standardized JSON error responses:
```json
{
  "error": "Unauthorized",
  "message": "Invalid or expired token",
  "statusCode": 401
}
```
