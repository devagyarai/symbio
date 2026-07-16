import { PrismaClient } from "@prisma/client";
import { logger } from "logger";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ||
  new PrismaClient({
    log: [
      { emit: "event", level: "query" },
      { emit: "event", level: "info" },
      { emit: "event", level: "warn" },
      { emit: "event", level: "error" },
    ],
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Use any to bypass strict Prisma event typing in this wrapper
(prisma as any).$on("query", (e: any) => {
  logger.debug({ duration: e.duration, target: e.target }, `Query: ${e.query}`);
});

(prisma as any).$on("warn", (e: any) => {
  logger.warn(`Prisma Warn: ${e.message}`);
});

(prisma as any).$on("error", (e: any) => {
  logger.error(`Prisma Error: ${e.message}`);
});

export * from "@prisma/client";
export * from "./health";
export * from "./transaction";
