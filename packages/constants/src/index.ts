// HTTP Status Codes
export const HttpStatus = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// MIME Types
export const MimeType = {
  JSON: "application/json",
  FORM_DATA: "multipart/form-data",
  URL_ENCODED: "application/x-www-form-urlencoded",
  TEXT: "text/plain",
  HTML: "text/html",
} as const;

// Roles
export const Roles = {
  SUPER_ADMIN: "SUPER_ADMIN",
  ORG_ADMIN: "ORG_ADMIN",
  MEMBER: "MEMBER",
  GUEST: "GUEST",
} as const;

// Permissions (examples)
export const Permissions = {
  MANAGE_ORG: "MANAGE_ORG",
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_BILLING: "MANAGE_BILLING",
  READ_DATA: "READ_DATA",
  WRITE_DATA: "WRITE_DATA",
} as const;

// Headers
export const Headers = {
  AUTHORIZATION: "Authorization",
  CONTENT_TYPE: "Content-Type",
  X_REQUEST_ID: "X-Request-Id",
  X_CORRELATION_ID: "X-Correlation-Id",
} as const;

// Limits
export const Limits = {
  MAX_PAGINATION_LIMIT: 100,
  DEFAULT_PAGINATION_LIMIT: 20,
  MAX_FILE_SIZE_MB: 50,
  RATE_LIMIT_WINDOW_MS: 15 * 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: 100,
} as const;

// Regex
export const Regex = {
  UUID_V4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  PASSWORD_STRENGTH: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

// Defaults
export const Defaults = {
  LOCALE: "en-US",
  TIMEZONE: "UTC",
} as const;
