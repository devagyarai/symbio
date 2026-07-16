import { getTraceId } from "context";

export interface ApiResponseOptions<T> {
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function createSuccessResponse<T>({ data, message, meta, pagination }: ApiResponseOptions<T>) {
  return {
    success: true,
    message,
    data,
    meta,
    pagination,
    timestamp: new Date().toISOString(),
    traceId: getTraceId(),
    version: "v1", // In a real app this would come from config/env
  };
}
