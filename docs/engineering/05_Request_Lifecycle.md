# Request Lifecycle & Context

Symbio injects a `traceId` and `correlationId` into every request using Node.js `AsyncLocalStorage` (via `packages/context`).

This allows deep services to retrieve the `traceId` without prop drilling:

```ts
import { getTraceId } from "context";

function doWork() {
  const traceId = getTraceId();
  // ...
}
```

Every request is logged on start and finish by the `pino-http` request logger.
