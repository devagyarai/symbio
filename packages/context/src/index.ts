import { AsyncLocalStorage } from "node:async_hooks";

export interface RequestContext {
  traceId: string;
  correlationId: string;
  userId?: string;
  orgId?: string;
  startTime: number;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export function getContext(): RequestContext | undefined {
  return requestContext.getStore();
}

export function getTraceId(): string | undefined {
  return getContext()?.traceId;
}
