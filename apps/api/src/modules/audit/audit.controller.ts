import { Request, Response, NextFunction } from 'express';
import { AuditService } from './audit.service';
import { AuditQuerySchema } from 'validation';
import { PermissionService } from '../../auth/permission.service';
import { AuthorizationError } from 'errors';

export class AuditController {
  static async getLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const query = AuditQuerySchema.parse(req.query);
      const user = (req as any).user!;

      // Authorization logic
      if (query.workspaceId) {
        // Must be Workspace ADMIN or SUPER_ADMIN
        const canManage = await PermissionService.verifyWorkspaceRole(user.userId, query.workspaceId, 'ADMIN');
        if (!canManage && user.systemRole !== 'SUPER_ADMIN') {
          throw new AuthorizationError('Only workspace admins can view workspace audit logs');
        }
      } else if (query.organizationId) {
        // Must be Organization OWNER or SUPER_ADMIN
        const canManage = await PermissionService.verifyOrgRole(user.userId, query.organizationId, 'OWNER');
        if (!canManage && user.systemRole !== 'SUPER_ADMIN') {
          throw new AuthorizationError('Only organization owners can view organization audit logs');
        }
      } else {
        // Global logs: Must be SUPER_ADMIN
        if (Object.keys(req.query).length === 0) {
          if (user.systemRole !== 'SUPER_ADMIN') {
            throw new AuthorizationError('Only super admins can view global audit logs');
          }
        }
      }

      const result = await AuditService.getLogs(query);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}
