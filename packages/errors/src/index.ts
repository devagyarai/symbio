

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly code?: string;

  constructor(message: string, statusCode: number = 500, code?: string, isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  public readonly details: unknown;
  constructor(message: string, details?: unknown) {
    super(message, 422, "VALIDATION_ERROR");
    this.details = details;
  }
}

export class AuthenticationError extends AppError {
  constructor(message = "Unauthenticated") {
    super(message, 401, "UNAUTHENTICATED");
  }
}

export class AuthorizationError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 403, "UNAUTHORIZED");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error") {
    super(message, 500, "INTERNAL_SERVER_ERROR", false);
  }
}

export function formatError(error: Error | AppError, traceId?: string) {
  if (error instanceof AppError) {
    return {
      error: {
        message: error.message,
        code: error.code,
        details: (error as ValidationError).details,
        traceId,
      },
    };
  }

  // Handle generic errors (hide details in prod, though formatting shouldn't care about env here directly)
  return {
    error: {
      message: "Internal Server Error",
      code: "INTERNAL_SERVER_ERROR",
      traceId,
    },
  };
}
