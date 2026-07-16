# Error Handling Standard

Always throw an `AppError` or its subclasses (`NotFoundError`, `ValidationError`, `AuthenticationError`, `AuthorizationError`, `ConflictError`).

Do NOT throw raw `Error` objects or generic strings in the API layer.
The global error handler will catch `AppError`, log it using `ErrorLogger`, and return a consistent JSON payload:

```json
{
  "error": {
    "message": "Resource not found",
    "code": "NOT_FOUND",
    "traceId": "uuid"
  }
}
```
