# Symbio Deployment Guide

This guide details the steps required to deploy the Symbio SaaS Platform in a production environment. 

Symbio is a full-stack turborepo structured into independent deployable packages:
- **Frontend (Web):** Next.js App (`apps/web`) -> Deployed to **Vercel**
- **Backend (API):** Node.js Express App (`apps/api`) -> Deployed to **Render / Railway**
- **Database:** Serverless PostgreSQL -> Hosted on **Neon**
- **Integrations:** Cloudinary (Storage) & Resend (Email)

---

## 1. Prerequisites

Before beginning deployment, ensure you have active accounts and API credentials for:
- [Vercel](https://vercel.com/) (Frontend Hosting)
- [Render](https://render.com/) or [Railway](https://railway.app/) (Backend Hosting)
- [Neon](https://neon.tech/) (Database)
- [Cloudinary](https://cloudinary.com/) (Image Storage)
- [Resend](https://resend.com/) (Transactional Emails)

---

## 2. Environment Variables Dictionary

The following environment variables must be configured across the platforms:

### A. Database (Neon)
_Apply these to the Backend deployment._
- `DATABASE_URL` : The pooled connection string (with `?pgbouncer=true`).
- `DIRECT_URL` : The direct connection string for Prisma Migrations.

### B. Authentication Secrets
_Apply these to the Backend deployment._
- `JWT_SECRET` : Min 32-character secure random string.
- `JWT_REFRESH_SECRET` : Min 32-character secure random string.

### C. Integrations
_Apply these to the Backend deployment._
- `CLOUDINARY_URL` : Full cloudinary URL.
- `CLOUDINARY_CLOUD_NAME` : Your cloud name.
- `CLOUDINARY_API_KEY` : Your API key.
- `CLOUDINARY_API_SECRET` : Your API secret.
- `RESEND_API_KEY` : Starts with `re_`.

### D. App Configuration
_Apply to Backend:_
- `NODE_ENV` : `production`
- `PORT` : `4000`
- `CORS_ORIGIN` : The URL of the deployed Vercel frontend (e.g., `https://app.symbio.com`).

_Apply to Frontend (Vercel):_
- `NEXT_PUBLIC_API_URL` : The URL of the deployed Backend (e.g., `https://api.symbio.com`).

---

## 3. Database Deployment (Neon)

1. Create a new project in Neon.
2. Navigate to **Dashboard -> Connection Details**.
3. Copy the **Pooled Connection String** (use as `DATABASE_URL`).
4. Copy the **Direct Connection String** (use as `DIRECT_URL`).

---

## 4. Backend Deployment (Render/Railway)

### Render Instructions
1. Create a new **Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Root Directory:** (Leave empty, Turborepo handles scoping)
   - **Build Command:** `pnpm install && pnpm build --filter=api`
   - **Start Command:** `pnpm start --filter=api`
4. Expand **Environment Variables** and input the keys defined in *Section 2 (A, B, C, D)*.
5. Click **Deploy**.

> **Note on Migrations:** It is highly recommended to run `npx prisma migrate deploy` during the build step, or manually execute it from the local machine targeting the production database using the Direct URL.

---

## 5. Frontend Deployment (Vercel)

1. Create a new project in Vercel.
2. Connect your GitHub repository.
3. Vercel automatically detects Next.js.
4. Configure the Build Settings:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web`
5. Configure Environment Variables:
   - `NEXT_PUBLIC_API_URL`: Your Render/Railway backend URL.
6. Click **Deploy**.

---

## 6. Deployment Order

To ensure a smooth launch, deploy the services in the following order:

1. **Provision Neon Database:** Get connection strings.
2. **Deploy Backend (Render):** Supply DB strings and start the API. Wait for the deploy to finish and obtain the live Backend URL.
3. **Database Migration:** Ensure Prisma migrations have run against the live DB.
4. **Deploy Frontend (Vercel):** Supply the live Backend URL to `NEXT_PUBLIC_API_URL`.
5. **Update Backend CORS:** Go back to Render and update `CORS_ORIGIN` to match the newly generated Vercel URL. Restart the backend service.

---

## 7. Rollback & Troubleshooting

### Database Rollback
If a Prisma migration breaks production:
1. Revert the schema commit in Git.
2. Resolve data manually using `psql` or Neon's SQL editor. (Prisma does not inherently "down" migrate; you restore from backup or manually fix schema).

### CORS Issues
- **Symptom:** Login fails silently, Network tab shows CORS Preflight error.
- **Fix:** Ensure `CORS_ORIGIN` on the backend matches the exact protocol and hostname of the frontend (no trailing slashes).

### Cookie Issues
- **Symptom:** Refresh token rotations fail, forcing users to log in repeatedly.
- **Fix:** Ensure the backend `auth.controller.ts` sets `sameSite: 'none'` and `secure: true` on the `refreshToken` cookie for cross-domain configurations.
