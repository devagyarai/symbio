import { Request, Response, NextFunction } from "express";
import { getTraceId, requestContext } from "context";
import { generateId } from "utils";

export function requestContextMiddleware(req: Request, res: Response, next: NextFunction) {
  const traceId = (req.headers["x-trace-id"] as string) || generateId();
  const correlationId = (req.headers["x-correlation-id"] as string) || generateId();
  
  // Also attach to req for Pino logger
  req.id = traceId;
  res.setHeader("X-Trace-Id", traceId);

  requestContext.run(
    {
      traceId,
      correlationId,
      startTime: Date.now(),
    },
    next
  );
}
