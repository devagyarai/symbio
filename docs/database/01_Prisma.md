# Prisma Configuration

Symbio uses Prisma as its ORM.
The schema is located at `packages/database/prisma/schema.prisma`.

## Singleton Pattern
In serverless or hot-reloading environments, we must prevent connection exhaustion.
The `packages/database/src/index.ts` exports a `prisma` singleton attached to `globalThis` in development.
