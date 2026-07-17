# Dependency Audit

## Overview
An exhaustive audit using `pnpm dlx depcheck` and manual inspection was executed to guarantee that no bloated, unused, or conflicting packages remain in the frontend scopes.

## Actions Taken

1. **`apps/web` Cleanups**:
   - Discovered that `recharts` was declared in `package.json` but entirely unused across all source files.
   - Removed `recharts` via `pnpm`, lightening the `node_modules` size and preventing redundant security scans.

2. **Required Pipeline Restorations**:
   - Next.js requires consumer-level styling parsers. The dependencies `tailwindcss`, `postcss`, and `autoprefixer` were intentionally injected as `devDependencies` into `apps/web/package.json` to properly bundle the application.

3. **`packages/ui` Integrity**:
   - Retained the local `utils.ts` implementation to decouple from the monorepo `utils` module. This strict dependency isolation prevents `node:async_hooks` (required by backend middleware) from being loaded by Webpack on the frontend, which previously crashed the build.

## Peer Dependency Status
- Slight Next.js peer warnings regarding React 19 vs Lucide/Radix are standard framework mismatches currently existing in the ecosystem. They do not block or break the React 19 execution environment in Next.js 15.

## Conclusion
All dependencies are actively invoked. No bloat or unused tracking packages remain.
