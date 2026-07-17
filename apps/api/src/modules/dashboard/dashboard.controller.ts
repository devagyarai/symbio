import { Request, Response, NextFunction } from 'express';
import { DashboardService } from './dashboard.service';
import { DashboardQuerySchema } from 'validation';
import { AuthorizationError } from 'errors';
import { PermissionService } from '../../auth/permission.service';
import { PresenceService } from '../../socket/presence.service';

/**
 * Resolves RBAC context from the request.
 * Returns the scoped organizationId / workspaceId that the caller is allowed to see.
 *
 * Rules:
 *  - SUPER_ADMIN → may pass any organizationId/workspaceId, or none (global view)
 *  - Org OWNER   → must pass their organizationId; can see org-scoped data
 *  - WS ADMIN    → must pass their workspaceId; can see workspace-scoped data
 *  - Others      → 403
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function resolveScope(req: Request): Promise<{
  organizationId?: string;
  workspaceId?: string;
  isSuperAdmin: boolean;
}> {
  const user = (req as any).user!;
  const isSuperAdmin = user.systemRole === 'SUPER_ADMIN';

  let queryOrgId = req.query.organizationId as string | undefined;
  const queryWsId = req.query.workspaceId as string | undefined;

  if (isSuperAdmin) {
    return { organizationId: queryOrgId, workspaceId: queryWsId, isSuperAdmin };
  }

  if (!queryOrgId && !queryWsId) {
    const firstOrg = await prisma.organizationMembership.findFirst({
      where: { userId: user.userId },
      orderBy: { createdAt: 'asc' },
    });
    if (firstOrg) {
      queryOrgId = firstOrg.organizationId;
    } else {
      // If no orgs, return a dummy UUID so DashboardService safely returns 0s instead of global stats
      return { organizationId: '00000000-0000-0000-0000-000000000000', isSuperAdmin };
    }
  }

  // Workspace Admin scope
  if (queryWsId) {
    const isMember = await PermissionService.verifyWorkspaceRole(user.userId, queryWsId, 'VIEWER');
    if (!isMember) {
      throw new AuthorizationError('You must be a member of this workspace to view its analytics');
    }
    return { workspaceId: queryWsId, isSuperAdmin };
  }

  // Org scope
  if (queryOrgId) {
    const isMember = await PermissionService.verifyOrgRole(user.userId, queryOrgId, 'MEMBER');
    if (!isMember) {
      throw new AuthorizationError('You must be a member of this organization to view its analytics');
    }
    return { organizationId: queryOrgId, isSuperAdmin };
  }

  throw new AuthorizationError('Access denied.');
}

// ─── Controller ───────────────────────────────────────────────────────────────

export class DashboardController {
  /**
   * GET /dashboard/overview
   * Returns high-level platform counters.
   */
  static async overview(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = await resolveScope(req);
      const rawQuery = DashboardQuerySchema.parse(req.query);
      const query = {
        ...rawQuery,
        organizationId: scope.organizationId,
        workspaceId: scope.workspaceId,
      };

      const data = await DashboardService.getOverview(query);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /dashboard/activity
   * Returns recent items across all entity types.
   */
  static async activity(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = await resolveScope(req);
      const rawQuery = DashboardQuerySchema.parse(req.query);
      const query = {
        ...rawQuery,
        organizationId: scope.organizationId,
        workspaceId: scope.workspaceId,
      };

      const data = await DashboardService.getActivity(query);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /dashboard/charts
   * Returns time-series datasets for frontend charting libraries.
   */
  static async charts(req: Request, res: Response, next: NextFunction) {
    try {
      const scope = await resolveScope(req);
      const rawQuery = DashboardQuerySchema.parse(req.query);
      const query = {
        ...rawQuery,
        organizationId: scope.organizationId,
        workspaceId: scope.workspaceId,
      };

      const data = await DashboardService.getCharts(query);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /dashboard/system
   * SUPER_ADMIN only — returns infrastructure health and runtime metrics.
   */
  static async system(req: Request, res: Response, next: NextFunction) {
    try {
      const user = (req as any).user!;
      if (user.systemRole !== 'SUPER_ADMIN') {
        throw new AuthorizationError('Only super admins can view system status');
      }

      const onlineUsers = PresenceService.getAllOnline().length;
      const data = await DashboardService.getSystemStatus(onlineUsers);
      res.json({ data });
    } catch (err) {
      next(err);
    }
  }
}
