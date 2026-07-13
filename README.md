# Symbio Monorepo

Welcome to the Symbio engineering foundation. This is a Turborepo-powered monorepo utilizing pnpm workspaces.

## Structure
- `apps/web`: Next.js 15 App Router (Frontend)
- `apps/api`: Express & Node.js API (Backend)
- `packages/eslint-config`: Shared ESLint & Prettier configurations
- `packages/tsconfig`: Shared TypeScript configurations
- `packages/ui`: Shared Tailwind & shadcn/ui components
- `packages/utils`: Shared utilities
- `packages/types`: Shared TypeScript definitions

## Getting Started

1. Install dependencies:
   ```bash
   pnpm install
   ```
2. Start the development server (runs both apps/web and apps/api concurrently):
   ```bash
   pnpm dev
   ```
3. Run linters:
   ```bash
   pnpm lint
   ```
4. Build all applications and packages:
   ```bash
   pnpm build
   ```

## Configuration Rationale
- **Turborepo**: Used for caching and fast concurrent builds across the workspace.
- **pnpm**: Enforces strict package hoisting and fast installations.
- **Shared Packages**: Prevents duplication of code, UI components, and TypeScript definitions across the API and the Client.
