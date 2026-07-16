import { PrismaClient, Prisma } from "@prisma/client";
import { prisma } from "./index";

// Defines a type that can be either the main prisma client or a transaction client
export type PrismaTransactionClient = Omit<
  PrismaClient,
  "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
>;

/**
 * Helper to run operations within a Prisma transaction safely.
 */
export async function runInTransaction<T>(
  callback: (tx: PrismaTransactionClient) => Promise<T>,
  options?: {
    maxWait?: number;
    timeout?: number;
    isolationLevel?: Prisma.TransactionIsolationLevel;
  }
): Promise<T> {
  return prisma.$transaction(callback, options);
}
