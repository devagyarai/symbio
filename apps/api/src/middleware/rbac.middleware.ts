import { Request, Response, NextFunction } from 'express';
import { SystemRole, OrgRole, WorkspaceRole } from '@prisma/client';
import { PermissionService, OrganizationPermission, WorkspacePermission } from '../auth/permission.service';

/**
 * Extracts organizationId and workspaceId from the request.
 * It favors route parameters (req.params) but falls back to body/query.
 */
const getIds = (req: Request) => {
  const organizationId = req.params.organizationId || req.body.organizationId || req.query.organizationId;
  const workspaceId = req.params.workspaceId || req.body.workspaceId || req.query.workspaceId;
  return { organizationId, workspaceId };
};

/**
 * Requires a minimum SystemRole.
 */
export const requireSystemRole = (requiredRole: SystemRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = (req as any).user;
      if (!payload || !payload.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const hasAccess = await PermissionService.verifySystemRole(payload.userId, requiredRole);
      if (!hasAccess) {
        res.status(403).json({ error: 'Forbidden: Insufficient system privileges' });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Requires a minimum OrgRole for a specific organization.
 */
export const requireOrganizationRole = (requiredRole: OrgRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = (req as any).user;
      if (!payload || !payload.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { organizationId } = getIds(req);
      if (!organizationId) {
        res.status(400).json({ error: 'Bad Request: Missing organizationId' });
        return;
      }

      const hasAccess = await PermissionService.verifyOrgRole(payload.userId, organizationId, requiredRole);
      if (!hasAccess) {
        // Return 404 to prevent enumeration if user is not in the org, 
        // but for simplicity, we return 403. A strict approach returns 404 if no membership exists.
        res.status(403).json({ error: 'Forbidden: Insufficient organization privileges' });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Requires a specific OrganizationPermission.
 */
export const requireOrgPermission = (permission: OrganizationPermission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = (req as any).user;
      if (!payload || !payload.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { organizationId } = getIds(req);
      if (!organizationId) {
        res.status(400).json({ error: 'Bad Request: Missing organizationId' });
        return;
      }

      const hasAccess = await PermissionService.verifyOrgPermission(payload.userId, organizationId, permission);
      if (!hasAccess) {
        res.status(403).json({ error: `Forbidden: Missing permission ${permission}` });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Requires a minimum WorkspaceRole for a specific workspace.
 */
export const requireWorkspaceRole = (requiredRole: WorkspaceRole) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = (req as any).user;
      if (!payload || !payload.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { workspaceId } = getIds(req);
      if (!workspaceId) {
        res.status(400).json({ error: 'Bad Request: Missing workspaceId' });
        return;
      }

      const hasAccess = await PermissionService.verifyWorkspaceRole(payload.userId, workspaceId, requiredRole);
      if (!hasAccess) {
        res.status(403).json({ error: 'Forbidden: Insufficient workspace privileges' });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Requires a specific WorkspacePermission.
 */
export const requireWorkspacePermission = (permission: WorkspacePermission) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = (req as any).user;
      if (!payload || !payload.userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const { workspaceId } = getIds(req);
      if (!workspaceId) {
        res.status(400).json({ error: 'Bad Request: Missing workspaceId' });
        return;
      }

      const hasAccess = await PermissionService.verifyWorkspacePermission(payload.userId, workspaceId, permission);
      if (!hasAccess) {
        res.status(403).json({ error: `Forbidden: Missing permission ${permission}` });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
