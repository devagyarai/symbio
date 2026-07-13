# Deployment Architecture

## Overview
Symbio utilizes a hybrid deployment model, taking advantage of edge networks for the frontend and stable, long-running processes for the backend and WebSocket connections.

## Infrastructure Providers

### Frontend: Vercel
- **Why:** Next.js is built by Vercel; deploying there provides out-of-the-box edge caching, image optimization, and seamless Server Actions support.
- **Pipeline:** Commits to `main` trigger automatic builds. Preview environments are generated for every Pull Request.

### Backend API & WebSockets: Render (or Railway)
- **Why:** While serverless functions (like Vercel API routes) are great, WebSocket connections require long-running server instances. We deploy the Node.js/Express application as a containerized web service.
- **Scaling:** Configured for auto-scaling based on CPU/Memory utilization.

### Database: Neon
- **Why:** Neon offers Serverless PostgreSQL. It separates storage and compute, allowing for bottomless storage and instant branching (useful for staging environments).
- **Pooling:** We utilize Neon's connection pooling (PgBouncer) to handle spikes in connections from the backend API.

### Real-time Pub/Sub: Redis (Upstash)
- **Why:** As the Node.js backend scales horizontally, Socket.IO needs a central message broker to broadcast events across different server instances. Upstash provides a serverless Redis solution perfect for this adapter.

### Object Storage: Cloudinary
- **Why:** Optimized for image and file delivery with built-in CDN and transformation capabilities.

## CI/CD Pipeline
1. **Developer Commits:** Code pushed to GitHub.
2. **GitHub Actions:** Runs Husky hooks, ESLint, TypeScript compiler checks, and automated tests.
3. **Vercel/Render:** Upon successful checks and merge to `main`, deployments are automatically triggered to production environments.
