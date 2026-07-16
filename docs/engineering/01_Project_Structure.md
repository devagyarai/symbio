# Project Structure

Symbio uses a Turborepo monorepo to separate concerns.

## Apps
- `apps/web`: Next.js 15 React application (frontend).
- `apps/api`: Node.js Express server (backend).

## Packages
- `config`: Environment validation and app configuration.
- `constants`: Global constants (HTTP status, limits, etc.).
- `context`: AsyncLocalStorage for trace IDs and correlation.
- `errors`: Unified application errors and formatter.
- `eslint-config`: Shared ESLint rules.
- `logger`: Pino-based structured logging.
- `tsconfig`: Base TS configurations.
- `types`: Shared TypeScript definitions.
- `ui`: Shared React components (shadcn/ui).
- `utils`: Shared utilities.
- `validation`: Zod schemas.
