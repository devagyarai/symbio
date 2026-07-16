# Seeding

To insert default settings and feature flags, run:

```bash
pnpm db:seed
```

The seed script is located at `packages/database/prisma/seed.ts` and uses `upsert` extensively so it is safe to run multiple times without causing duplicate key errors.
