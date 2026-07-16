# Symbio API Documentation

This document provides a reference for the RESTful endpoints available in the Symbio Backend. 

**Base URL:** `/` (Locally: `http://localhost:4000`)  
**Authentication:** Most endpoints require a Bearer token in the `Authorization` header: `Authorization: Bearer <access_token>`

---

## 🔐 Authentication & Identity (`/auth`)

### 1. Register User
- **Method:** `POST`
- **Route:** `/auth/register`
- **Auth Required:** No
- **Payload:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!",
    "name": "Jane Doe"
  }
  ```
- **Responses:**
  - `201 Created`: `{ "userId": "uuid", "message": "Verification email sent" }`
  - `409 Conflict`: Email already exists.

### 2. Login User
- **Method:** `POST`
- **Route:** `/auth/login`
- **Auth Required:** No
- **Payload:**
  ```json
  {
    "email": "user@example.com",
    "password": "SecurePassword123!"
  }
  ```
- **Responses:**
  - `200 OK`: `{ "accessToken": "jwt", "user": { ... } }` *(Sets HttpOnly `refreshToken` cookie)*
  - `401 Unauthorized`: Invalid credentials.

### 3. Refresh Token
- **Method:** `POST`
- **Route:** `/auth/refresh`
- **Auth Required:** Cookie (`refreshToken`)
- **Responses:**
  - `200 OK`: `{ "accessToken": "new_jwt" }`

### 4. Logout
- **Method:** `POST`
- **Route:** `/auth/logout`
- **Auth Required:** Cookie (`refreshToken`)
- **Responses:**
  - `200 OK`: `{ "message": "Logged out successfully" }`

---

## 🏢 Organizations (`/organizations`)

### 1. Create Organization
- **Method:** `POST`
- **Route:** `/organizations`
- **Auth Required:** Yes
- **Payload:**
  ```json
  {
    "name": "Acme Corp",
    "slug": "acme-corp",
    "logoUrl": "https://..."
  }
  ```
- **Responses:** `201 Created`

### 2. List Organizations
- **Method:** `GET`
- **Route:** `/organizations?page=1&limit=20&q=Acme`
- **Auth Required:** Yes
- **Responses:**
  - `200 OK`: `{ "data": [...], "meta": { "total": 1, "page": 1, "limit": 20 } }`

---

## 📂 Workspaces (`/workspaces`)

### 1. Create Workspace
- **Method:** `POST`
- **Route:** `/workspaces`
- **Auth Required:** Yes (Must be Org OWNER or ADMIN)
- **Payload:**
  ```json
  {
    "organizationId": "uuid",
    "name": "Engineering Team",
    "slug": "engineering"
  }
  ```
- **Responses:** `201 Created`

### 2. List Workspaces
- **Method:** `GET`
- **Route:** `/workspaces?organizationId=uuid`
- **Auth Required:** Yes
- **Responses:** `200 OK`

---

## 📜 Audit Logs (`/audit`)

### 1. Retrieve Audit Logs
- **Method:** `GET`
- **Route:** `/audit?organizationId=uuid&page=1`
- **Auth Required:** Yes (Must be SUPER_ADMIN, or Org OWNER for `organizationId`, or Workspace ADMIN for `workspaceId`)
- **Responses:**
  - `200 OK`: `{ "data": [...], "meta": { ... } }`
  - `403 Forbidden`: Unauthorized to view logs.

---

## 📈 Dashboard Analytics (`/dashboard`)

### 1. Get Platform Overview
- **Method:** `GET`
- **Route:** `/dashboard/overview`
- **Auth Required:** Yes (SUPER_ADMIN only)
- **Responses:**
  - `200 OK`: Returns aggregate statistics (total users, active sessions, storage used, etc).

---

## ☁️ File Uploads (`/upload`)

### 1. Upload Image
- **Method:** `POST`
- **Route:** `/upload/image`
- **Auth Required:** Yes
- **Headers:** `Content-Type: multipart/form-data`
- **Body:** `file` (Binary), `workspaceId` (String)
- **Responses:**
  - `201 Created`: `{ "url": "https://res.cloudinary.com/...", "id": "uuid" }`
  - `422 Unprocessable Entity`: Invalid MIME type or file too large.
