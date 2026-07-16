import { Request, Response, NextFunction } from 'express';
import { WorkspaceService } from './workspace.service';
import { CreateWorkspaceSchema, UpdateWorkspaceSchema, PaginationQuerySchema } from 'validation';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../../socket/notification.service';

export class WorkspaceController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const data = CreateWorkspaceSchema.parse(req.body);
      // Ensure organizationId is in body so rbac.middleware extracts it
      const workspace = await WorkspaceService.create(userId, data);

      await AuditService.log({
        action: 'CREATE',
        entity: 'Workspace',
        entityId: workspace.id,
        actorId: userId,
        workspaceId: workspace.id,
        organizationId: workspace.organizationId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json(workspace);
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const query = PaginationQuerySchema.parse(req.query);
      const result = await WorkspaceService.findAll(userId, query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const workspaceId = req.params.workspaceId;
      const workspace = await WorkspaceService.findOne(userId, workspaceId);
      res.status(200).json(workspace);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.workspaceId;
      const data = UpdateWorkspaceSchema.parse(req.body);
      const workspace = await WorkspaceService.update(workspaceId, data);

      await AuditService.log({
        action: 'UPDATE',
        entity: 'Workspace',
        entityId: workspace.id,
        actorId: (req as any).user.userId,
        workspaceId: workspace.id,
        organizationId: workspace.organizationId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      NotificationService.emitWorkspaceUpdated(workspace.id, workspace as any);

      res.status(200).json(workspace);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.workspaceId;
      await WorkspaceService.delete(workspaceId);

      await AuditService.log({
        action: 'DELETE',
        entity: 'Workspace',
        entityId: workspaceId,
        actorId: (req as any).user.userId,
        workspaceId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      NotificationService.emitWorkspaceUpdated(workspaceId, { deleted: true, id: workspaceId });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
