# Risk Assessment & Mitigation

## Overview
Identifying and mitigating technical and operational risks before implementation is crucial for a production-grade application like Symbio.

## 1. Data Leakage Across Tenants
- **Risk Level:** CRITICAL
- **Description:** A flaw in querying logic could expose Organization A's data to a user in Organization B.
- **Mitigation Strategy:**
  - Enforce `orgId` filtering at the lowest possible layer (Prisma service wrappers).
  - Utilize strict Express middleware that injects `req.tenant` only after verifying database RBAC relationships.
  - Implement comprehensive integration tests specifically testing cross-tenant access attempts.

## 2. WebSocket Scaling Limitations
- **Risk Level:** MEDIUM
- **Description:** Stateful WebSocket connections consume memory. A single Node.js instance will eventually bottleneck as concurrent users grow.
- **Mitigation Strategy:**
  - Architect the Socket.IO implementation to use the Redis adapter from day one.
  - Offload long-polling fallbacks to the load balancer level where possible.

## 3. Database Connection Exhaustion
- **Risk Level:** MEDIUM
- **Description:** Sudden spikes in traffic could exhaust PostgreSQL connection limits, causing API timeouts.
- **Mitigation Strategy:**
  - Utilize Neon's built-in PgBouncer connection pooling.
  - Keep database transactions as short as possible.

## 4. Token Expiry UX Friction
- **Risk Level:** LOW
- **Description:** Users being abruptly logged out while typing a long comment due to a 15-minute JWT expiry.
- **Mitigation Strategy:**
  - Implement a silent refresh mechanism on the Next.js client using an Axios interceptor.
  - If a request fails with 401, the client automatically attempts a `/refresh` call using the `HttpOnly` cookie before retrying the original request.
