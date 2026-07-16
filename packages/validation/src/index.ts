import { z } from "zod";


// Primitives
export const uuidSchema = z.string().regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, "Invalid UUID v4");
export const emailSchema = z.string().email("Invalid email format");
export const passwordSchema = z.string().regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/, "Password does not meet complexity requirements");

// Pagination
export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),
});

// Common Headers
export const authHeaderSchema = z.object({
  authorization: z.string().startsWith("Bearer ", "Missing or invalid Bearer token"),
});

// Common Query
export const searchSchema = z.object({
  q: z.string().min(1).max(255).optional(),
});

export * from "./auth";
export * from "./query";
export * from "./organization";
export * from "./workspace";
