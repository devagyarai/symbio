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
async function resolveScope(req: Request): Promise<{
  organizationId?: string;
  workspaceId?: string;
  isSuperAdmin: boolean;
}> {
  const user = (req as any).user!;
  const isSuperAdmin = user.systemRole === 'SUPER_ADMIN';

  const queryOrgId = req.query.organizationId as string | undefined;
  const queryWsId = req.query.workspaceId as string | undefined;

  if (isSuperAdmin) {
    return { organizationId: queryOrgId, workspaceId: queryWsId, isSuperAdmin };
  }

  // Org Owner scope
  if (queryOrgId) {
    const isOwner = await PermissionService.verifyOrgRole(user.userId, queryOrgId, 'OWNER');
    if (!isOwner) {
      throw new AuthorizationError('Only organization owners can view organization analytics');
    }
    return { organizationId: queryOrgId, isSuperAdmin };
  }

  // Workspace Admin scope
  if (queryWsId) {
    const isAdmin = await PermissionService.verifyWorkspaceRole(user.userId, queryWsId, 'ADMIN');
    if (!isAdmin) {
      throw new AuthorizationError('Only workspace admins can view workspace analytics');
    }
    return { workspaceId: queryWsId, isSuperAdmin };
  }

  // No scope provided and not super admin → 403
  throw new AuthorizationError(
    'Access denied. Provide an organizationId or workspaceId you manage, or be a SUPER_ADMIN.',
  );
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
