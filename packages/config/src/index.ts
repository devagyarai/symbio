import { z } from "zod";
import * as dotenv from "dotenv";
import path from "path";

// Load root .env file in development (simplified for workspace root access)
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url(),
  LOG_LEVEL: z.enum(["debug", "info", "warn", "error", "fatal"]).default("info"),
  LOG_PRETTY: z.enum(["true", "false"]).transform((v) => v === "true").default("false"),
  CORS_ORIGIN: z.string().url().default("http://localhost:3000"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("❌ Invalid environment variables:", parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  env: parsed.data.NODE_ENV,
  server: {
    port: parsed.data.PORT,
  },
  db: {
    url: parsed.data.DATABASE_URL,
  },
  logging: {
    level: parsed.data.LOG_LEVEL,
    pretty: parsed.data.LOG_PRETTY,
  },
  security: {
    corsOrigin: parsed.data.CORS_ORIGIN,
  },
} as const;
