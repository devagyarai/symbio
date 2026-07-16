import { PrismaClient, SessionStatus } from '@prisma/client';
import os from 'os';
import { DashboardQuery } from 'validation';
import { PresenceService } from '../../socket/presence.service';

const prisma = new PrismaClient();

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Returns a Date N days ago from now. */
const daysAgo = (n: number): Date => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Returns midnight at the start of today. */
const todayStart = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

/** Returns midnight at the start of the first day of the current month. */
const monthStart = (): Date => {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

/**
 * Converts a Prisma groupBy result (keyed by a date field) into a full
 * date-series array with zero-filled gaps, so charts always have
 * a continuous x-axis.
 */
function fillDateSeries(
  raw: { date: string; count: number }[],
  days: number,
): { date: string; count: number }[] {
  const map = new Map(raw.map((r) => [r.date, r.count]));
  const result: { date: string; count: number }[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = daysAgo(i);
    const key = d.toISOString().split('T')[0];
    result.push({ date: key, count: map.get(key) ?? 0 });
  }
  return result;
}

// ─── Service ──────────────────────────────────────────────────────────────────

export class DashboardService {
  // ── GET /dashboard/overview ───────────────────────────────────────────────

  /**
   * Returns high-level platform counters.
   * For SUPER_ADMIN: global totals.
   * For Org Owner: scoped to their organization.
   * For Workspace Admin: scoped to their workspace.
   */
  static async getOverview(query: DashboardQuery) {
    const dateFilter = query.startDate || query.endDate
      ? {
          createdAt: {
            ...(query.startDate && { gte: new Date(query.startDate) }),
            ...(query.endDate && { lte: new Date(query.endDate) }),
          },
        }
      : {};

    // Run all counts in a single parallel batch to avoid N+1
    const [
      totalOrganizations,
      totalWorkspaces,
      totalUsers,
      activeSessions,
      uploadedFiles,
      storageUsedResult,
      auditEventsToday,
    ] = await Promise.all([
      prisma.organization.count({
        where: {
          ...(query.organizationId && { id: query.organizationId }),
          ...dateFilter,
        },
      }),
      prisma.workspace.count({
        where: {
          ...(query.organizationId && { organizationId: query.organizationId }),
          ...(query.workspaceId && { id: query.workspaceId }),
          ...dateFilter,
        },
      }),
      prisma.user.count({
        where: {
          ...(query.organizationId && {
            orgMemberships: { some: { organizationId: query.organizationId } },
          }),
          ...(query.workspaceId && {
            workspaceMemberships: { some: { workspaceId: query.workspaceId } },
          }),
        },
      }),
      prisma.session.count({
        where: {
          status: SessionStatus.ACTIVE,
          expiresAt: { gt: new Date() },
          ...(query.organizationId && {
            user: {
              orgMemberships: { some: { organizationId: query.organizationId } },
            },
          }),
        },
      }),
      prisma.fileAsset.count({
        where: {
          ...(query.workspaceId && { workspaceId: query.workspaceId }),
          ...(query.organizationId && {
            workspace: { organizationId: query.organizationId },
          }),
        },
      }),
      // Aggregate total storage in bytes
      prisma.fileAsset.aggregate({
        _sum: { size: true },
        where: {
          ...(query.workspaceId && { workspaceId: query.workspaceId }),
          ...(query.organizationId && {
            workspace: { organizationId: query.organizationId },
          }),
        },
      }),
      prisma.auditLog.count({
        where: {
          createdAt: { gte: todayStart() },
          ...(query.organizationId && { organizationId: query.organizationId }),
          ...(query.workspaceId && { workspaceId: query.workspaceId }),
        },
      }),
    ]);

    // Online users from in-memory presence (scoped or global)
    const onlineUsers = query.workspaceId
      ? PresenceService.getOnlineUsers(query.workspaceId).length
      : PresenceService.getAllOnline().length;

    const storageUsed = storageUsedResult._sum.size ?? 0;

    return {
      totalOrganizations,
      totalWorkspaces,
      totalUsers,
      onlineUsers,
      activeSessions,
      uploadedFiles,
      storageUsed,
      storageUsedMB: +(storageUsed / (1024 * 1024)).toFixed(2),
      auditEventsToday,
    };
  }

  // ── GET /dashboard/activity ───────────────────────────────────────────────

  /**
   * Returns the most recent items across entities for the activity feed.
   */
  static async getActivity(query: DashboardQuery) {
    const limit = query.limit ?? 10;
    const orgWhere = query.organizationId ? { id: query.organizationId } : {};
    const orgFilter = query.organizationId ? { organizationId: query.organizationId } : {};
    const wsFilter = query.workspaceId ? { workspaceId: query.workspaceId } : {};
    const orgWsFilter = {
      ...(query.organizationId && { workspace: { organizationId: query.organizationId } }),
      ...(query.workspaceId && { workspaceId: query.workspaceId }),
    };

    const [
      recentOrganizations,
      recentWorkspaces,
      recentUploads,
      recentAuditLogs,
      recentLogins,
    ] = await Promise.all([
      prisma.organization.findMany({
        where: orgWhere,
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: { id: true, name: true, slug: true, createdAt: true },
      }),
      prisma.workspace.findMany({
        where: { ...orgFilter, ...wsFilter },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          name: true,
          slug: true,
          createdAt: true,
          organization: { select: { id: true, name: true } },
        },
      }),
      prisma.fileAsset.findMany({
        where: orgWsFilter,
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          originalName: true,
          mimeType: true,
          size: true,
          url: true,
          createdAt: true,
          workspace: { select: { id: true, name: true } },
        },
      }),
      prisma.auditLog.findMany({
        where: {
          ...wsFilter,
          ...(query.organizationId && { organizationId: query.organizationId }),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          actorId: true,
          createdAt: true,
          actor: { select: { id: true, name: true, email: true } },
        },
      }),
      // Recent logins = recent ACTIVE sessions ordered by creation
      prisma.session.findMany({
        where: {
          createdAt: { gte: daysAgo(7) },
          ...(query.organizationId && {
            user: {
              orgMemberships: { some: { organizationId: query.organizationId } },
            },
          }),
        },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          createdAt: true,
          ipAddress: true,
          status: true,
          user: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    return {
      recentOrganizations,
      recentWorkspaces,
      recentUploads,
      recentAuditLogs,
      recentLogins,
    };
  }

  // ── GET /dashboard/charts ─────────────────────────────────────────────────

  /**
   * Returns time-series and aggregated data for frontend charts.
   * Uses raw SQL via $queryRaw for efficient date-truncated grouping.
   */
  static async getCharts(query: DashboardQuery) {
    const orgFilter = query.organizationId ? { organizationId: query.organizationId } : {};
    const wsFilter = query.workspaceId ? { workspaceId: query.workspaceId } : {};
    const MONTHS = 12;
    const DAYS = 30;

    const monthSince = new Date();
    monthSince.setMonth(monthSince.getMonth() - MONTHS);

    const daySince = daysAgo(DAYS);

    // ── Orgs per month ───────────────────────────────────────────────────────
    const orgsPerMonthRaw: Array<{ month: Date; count: bigint }> = await prisma.$queryRaw`
      SELECT date_trunc('month', "createdAt") AS month,
             COUNT(*)::int                    AS count
      FROM "Organization"
      WHERE "createdAt" >= ${monthSince}
      GROUP BY month
      ORDER BY month ASC
    `;

    // ── Workspaces per month ─────────────────────────────────────────────────
    const wsPerMonthRaw: Array<{ month: Date; count: bigint }> = query.organizationId
      ? await prisma.$queryRaw`
          SELECT date_trunc('month', "createdAt") AS month,
                 COUNT(*)::int                    AS count
          FROM "Workspace"
          WHERE "createdAt" >= ${monthSince}
            AND "organizationId" = ${query.organizationId}::uuid
          GROUP BY month
          ORDER BY month ASC
        `
      : await prisma.$queryRaw`
          SELECT date_trunc('month', "createdAt") AS month,
                 COUNT(*)::int                    AS count
          FROM "Workspace"
          WHERE "createdAt" >= ${monthSince}
          GROUP BY month
          ORDER BY month ASC
        `;

    // ── Uploads per day (30 days) ────────────────────────────────────────────
    const uploadsPerDayRaw: Array<{ day: Date; count: bigint }> = query.workspaceId
      ? await prisma.$queryRaw`
          SELECT date_trunc('day', "createdAt") AS day,
                 COUNT(*)::int                  AS count
          FROM "FileAsset"
          WHERE "createdAt" >= ${daySince}
            AND "workspaceId" = ${query.workspaceId}::uuid
          GROUP BY day
          ORDER BY day ASC
        `
      : await prisma.$queryRaw`
          SELECT date_trunc('day', "createdAt") AS day,
                 COUNT(*)::int                  AS count
          FROM "FileAsset"
          WHERE "createdAt" >= ${daySince}
          GROUP BY day
          ORDER BY day ASC
        `;

    // ── Audit events per day (30 days) ───────────────────────────────────────
    const auditPerDayRaw: Array<{ day: Date; count: bigint }> = query.organizationId
      ? await prisma.$queryRaw`
          SELECT date_trunc('day', "createdAt") AS day,
                 COUNT(*)::int                  AS count
          FROM "AuditLog"
          WHERE "createdAt" >= ${daySince}
            AND "organizationId" = ${query.organizationId}::uuid
          GROUP BY day
          ORDER BY day ASC
        `
      : await prisma.$queryRaw`
          SELECT date_trunc('day', "createdAt") AS day,
                 COUNT(*)::int                  AS count
          FROM "AuditLog"
          WHERE "createdAt" >= ${daySince}
          GROUP BY day
          ORDER BY day ASC
        `;

    // ── Logins per day (30 days) ─────────────────────────────────────────────
    const loginsPerDayRaw: Array<{ day: Date; count: bigint }> = await prisma.$queryRaw`
      SELECT date_trunc('day', "createdAt") AS day,
             COUNT(*)::int                  AS count
      FROM "Session"
      WHERE "createdAt" >= ${daySince}
      GROUP BY day
      ORDER BY day ASC
    `;

    // ── Top active workspaces (by file count) ────────────────────────────────
    const topWorkspaces = await prisma.workspace.findMany({
      where: orgFilter,
      take: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { fileAssets: true, memberships: true } },
      },
      orderBy: { fileAssets: { _count: 'desc' } },
    });

    // ── Most active organizations (by workspace count) ────────────────────────
    const topOrganizations = await prisma.organization.findMany({
      take: 10,
      select: {
        id: true,
        name: true,
        slug: true,
        _count: { select: { workspaces: true, memberships: true } },
      },
      orderBy: { workspaces: { _count: 'desc' } },
    });

    // ── Format month series ──────────────────────────────────────────────────
    const formatMonthSeries = (raw: { month: Date; count: bigint }[]) =>
      raw.map((r) => ({
        month: r.month.toISOString().substring(0, 7), // YYYY-MM
        count: Number(r.count),
      }));

    const formatDaySeries = (raw: { day: Date; count: bigint }[]) => {
      const mapped = raw.map((r) => ({
        date: r.day.toISOString().split('T')[0],
        count: Number(r.count),
      }));
      return fillDateSeries(mapped, DAYS);
    };

    return {
      organizationsPerMonth: formatMonthSeries(orgsPerMonthRaw),
      workspacesPerMonth: formatMonthSeries(wsPerMonthRaw),
      uploadsPerDay: formatDaySeries(uploadsPerDayRaw),
      auditEventsPerDay: formatDaySeries(auditPerDayRaw),
      loginsPerDay: formatDaySeries(loginsPerDayRaw),
      topActiveWorkspaces: topWorkspaces.map((w) => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        fileCount: w._count.fileAssets,
        memberCount: w._count.memberships,
      })),
      mostActiveOrganizations: topOrganizations.map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        workspaceCount: o._count.workspaces,
        memberCount: o._count.memberships,
      })),
    };
  }

  // ── GET /dashboard/system ─────────────────────────────────────────────────

  /**
   * Returns system health and runtime info.
   * Database connectivity is verified with a lightweight $queryRaw ping.
   */
  static async getSystemStatus(onlineUsersCount: number) {
    // ── Database ping ─────────────────────────────────────────────────────
    let databaseStatus: 'connected' | 'error' = 'connected';
    try {
      await prisma.$queryRaw`SELECT 1`;
    } catch {
      databaseStatus = 'error';
    }

    // ── Cloudinary status ─────────────────────────────────────────────────
    let cloudinaryStatus: 'configured' | 'not_configured' = 'not_configured';
    if (
      process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
    ) {
      cloudinaryStatus = 'configured';
    }

    return {
      databaseStatus,
      cloudinaryStatus,
      socketStatus: onlineUsersCount >= 0 ? 'running' : 'unknown',
      onlineUsers: onlineUsersCount,
      apiVersion: process.env.npm_package_version ?? '0.1.0',
      serverUptime: Math.floor(process.uptime()),
      serverUptimeFormatted: formatUptime(process.uptime()),
      environment: process.env.NODE_ENV ?? 'development',
      nodeVersion: process.version,
      platform: os.platform(),
      memoryUsageMB: {
        heapUsed: +(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2),
        heapTotal: +(process.memoryUsage().heapTotal / 1024 / 1024).toFixed(2),
        rss: +(process.memoryUsage().rss / 1024 / 1024).toFixed(2),
      },
    };
  }
}

// ── Utility ───────────────────────────────────────────────────────────────────

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const parts: string[] = [];
  if (d > 0) parts.push(`${d}d`);
  if (h > 0) parts.push(`${h}h`);
  if (m > 0) parts.push(`${m}m`);
  parts.push(`${s}s`);
  return parts.join(' ');
}
