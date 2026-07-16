# Logging Standard

We use `Pino` for structured JSON logging.
Import `logger`, `ErrorLogger`, `DevelopmentLogger`, or `ProductionLogger` from `packages/logger`.

Never use `console.log` in production code.

Log levels:
- `debug`: Detailed trace information.
- `info`: General operational messages.
- `warn`: Handled errors, deprecations.
- `error`: Unhandled exceptions, system failures.
- `fatal`: Critical failure requiring restart.
