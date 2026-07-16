import { prisma } from "./index";

export async function checkDatabaseHealth() {
  const start = performance.now();
  try {
    // A simple query to verify connection
    await prisma.$queryRaw`SELECT 1`;
    const latency = performance.now() - start;

    // Check migration version (if applicable/accessible)
    let latestMigration = "unknown";
    try {
      const result = await prisma.$queryRaw<{ migration_name: string }[]>`
        SELECT migration_name FROM _prisma_migrations ORDER BY finished_at DESC LIMIT 1
      `;
      if (result && result.length > 0) {
        latestMigration = result[0].migration_name;
      }
    } catch (e) {
      // Ignore if table doesn't exist yet
    }

    return {
      status: "OK",
      latencyMs: Math.round(latency),
      latestMigration,
    };
  } catch (error) {
    return {
      status: "ERROR",
      latencyMs: Math.round(performance.now() - start),
      error: error instanceof Error ? error.message : "Unknown database error",
    };
  }
}
