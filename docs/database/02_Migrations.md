# Migrations

All database changes must be tracked via migrations.

1. **Local Dev**: Run `pnpm db:migrate` to generate and apply a new migration locally.
2. **Prototyping**: Run `pnpm db:push` to force schema synchronization without tracking history (not recommended for production branches).
3. **Reset**: Run `pnpm db:reset` to drop everything and re-apply from scratch.

Migrations are output to `packages/database/prisma/migrations`.
