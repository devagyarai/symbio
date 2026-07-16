import { PrismaClient, Prisma } from '@prisma/client';
import { AuditQuery } from 'validation';

const prisma = new PrismaClient();

export interface AuditLogPayload {
  action: string;
  entity: string;
  entityId: string;
  actorId?: string;
  workspaceId?: string;
  organizationId?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: Record<string, any>;
}

export class AuditService {
  /**
   * Write an audit log entry.
   * This is fire-and-forget; it returns the promise but shouldn't generally block the request.
   * After persisting the log, it broadcasts activity_logged via the NotificationService.
   */
  static async log(payload: AuditLogPayload) {
    try {
      const auditLog = await prisma.auditLog.create({
        data: {
          action: payload.action,
          entity: payload.entity,
          entityId: payload.entityId,
          actorId: payload.actorId,
          workspaceId: payload.workspaceId,
          organizationId: payload.organizationId,
          ipAddress: payload.ipAddress,
          userAgent: payload.userAgent,
          metadata: payload.metadata ? (payload.metadata as any) : undefined,
        },
      });

      // Emit real-time event after persisting — import lazily to avoid circular dep issues
      // if the socket server is not yet initialized (e.g., during tests), this is a no-op.
      try {
        const { NotificationService } = await import('../../socket/notification.service');
        NotificationService.emitActivityLogged(
          auditLog as any,
          payload.workspaceId,
          payload.organizationId,
        );
      } catch {
        // NotificationService not initialized — safe to ignore (e.g., in unit tests)
      }

      return auditLog;
    } catch (error) {
      // Typically, audit log failure shouldn't crash the main process, but we log it to console
      console.error('Failed to write audit log:', error);
    }
  }


  /**
   * Retrieve audit logs with filtering and pagination.
   */
  static async getLogs(query: AuditQuery) {
    const page = query.page || 1;
    const limit = query.limit || 20;
    const skip = (page - 1) * limit;

    const where: Prisma.AuditLogWhereInput = {};

    if (query.actorId) {
      where.actorId = query.actorId;
    }
    if (query.action) {
      where.action = query.action;
    }
    if (query.entity) {
      where.entity = query.entity;
    }
    if (query.workspaceId) {
      where.workspaceId = query.workspaceId;
    }
    if (query.organizationId) {
      where.organizationId = query.organizationId;
    }
    
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) {
        where.createdAt.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        where.createdAt.lte = new Date(query.endDate);
      }
    }

    if (query.q) {
      // Basic search on action and entity
      where.OR = [
        { action: { contains: query.q, mode: 'insensitive' } },
        { entity: { contains: query.q, mode: 'insensitive' } },
      ];
    }

    const [total, data] = await Promise.all([
      prisma.auditLog.count({ where }),
      prisma.auditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [query.sortBy || 'createdAt']: query.sortOrder || 'desc',
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
