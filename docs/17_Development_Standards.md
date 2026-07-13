# Development Standards

## Overview
To maintain a high-quality, production-ready codebase, all developers contributing to Symbio must adhere to the following standards.

## 1. Typing (TypeScript)
- **Strict Mode:** TypeScript `strict` mode is enabled and must remain so.
- **`any` is Forbidden:** Use `unknown` if a type is truly dynamic, and use type narrowing. Explicit `any` will fail CI checks.
- **Interfaces vs. Types:** Use `interface` for object shapes that may be extended; use `type` for unions and utility types.

## 2. Code Formatting & Linting
- **Prettier:** Code formatting is strictly handled by Prettier. Do not argue over formatting; let the tool handle it.
- **ESLint:** We use an aggressive ESLint configuration. All warnings should be treated as errors.
- **Pre-commit Hooks:** Husky is configured to run linting and type-checking on staged files before allowing a commit.

## 3. Naming Conventions
- **Files:** `kebab-case.ts` (or `.tsx`) for all files.
- **Components:** `PascalCase` for React components.
- **Variables/Functions:** `camelCase` for variables and functions.
- **Constants:** `UPPER_SNAKE_CASE` for global constants.

## 4. Git Workflow
- **Branching:** Use `feature/<issue-number>-<short-description>`, `bugfix/<issue-number>-<description>`, or `chore/<description>`.
- **Commits:** Follow Conventional Commits specification (e.g., `feat: add task creation endpoint`).
- **PRs:** Pull Requests require at least one approving review and a passing CI pipeline before merging to `main`.

## 5. Security Practices in Code
- Never log raw request bodies or passwords.
- Always validate input at the edges using Zod (both in the Next.js client and Express API).
- Ensure `orgId` is present in every Prisma `where` clause when reading or writing tenant data.
