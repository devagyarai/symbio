# Database Naming Conventions

- **Models**: PascalCase (e.g. `SystemSetting`).
- **Fields**: camelCase (e.g. `isEnabled`).
- **IDs**: UUIDv4 strings. All primary keys should be named `id`.
- **Timestamps**: Every model should have `createdAt` and `updatedAt`.
- **Foreign Keys**: Named `modelNameId` (e.g. `userId`, `organizationId`).
