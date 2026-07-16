import { Request, Response, NextFunction } from "express";
import { formatError, AppError, NotFoundError, ValidationError } from "errors";
import { ZodError } from "zod";
import { getTraceId } from "context";
import { ErrorLogger } from "logger";

export function notFoundHandler(req: Request, res: Response, next: NextFunction) {
  next(new NotFoundError(`Route ${req.method} ${req.originalUrl} not found`));
}

export function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
) {
  const traceId = getTraceId();

  if (err instanceof ZodError) {
    const validationError = new ValidationError(
      "Validation failed",
      err.flatten().fieldErrors
    );

    ErrorLogger.warn(
      { err: validationError, traceId },
      validationError.message
    );

    return res
      .status(validationError.statusCode)
      .json(formatError(validationError, traceId));
  }

  if (err instanceof AppError && err.isOperational) {
    ErrorLogger.warn(
      { err, traceId },
      err.message
    );

    return res
      .status(err.statusCode)
      .json(formatError(err, traceId));
  }

  const unknownError =
    err instanceof Error
      ? err
      : new Error("Unknown error");

  ErrorLogger.error(
    { err: unknownError, traceId },
    "Unhandled exception"
  );

  return res
    .status(500)
    .json(formatError(unknownError, traceId));
}

