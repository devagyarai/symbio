import { Request, Response, NextFunction } from 'express';
import { OrganizationService } from './organization.service';
import { CreateOrganizationSchema, UpdateOrganizationSchema, PaginationQuerySchema } from 'validation';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../../socket/notification.service';

export class OrganizationController {
  static async create(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const data = CreateOrganizationSchema.parse(req.body);
      const organization = await OrganizationService.create(userId, data);

      await AuditService.log({
        action: 'CREATE',
        entity: 'Organization',
        entityId: organization.id,
        actorId: userId,
        organizationId: organization.id,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json(organization);
    } catch (error) {
      next(error);
    }
  }

  static async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const query = PaginationQuerySchema.parse(req.query);
      const result = await OrganizationService.findAll(userId, query);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async findOne(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.userId;
      const organizationId = req.params.organizationId;
      const organization = await OrganizationService.findOne(userId, organizationId);
      res.status(200).json(organization);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.params.organizationId;
      const data = UpdateOrganizationSchema.parse(req.body);
      const organization = await OrganizationService.update(organizationId, data);

      await AuditService.log({
        action: 'UPDATE',
        entity: 'Organization',
        entityId: organization.id,
        actorId: (req as any).user.userId,
        organizationId: organization.id,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      NotificationService.emitOrganizationUpdated(organization.id, organization as any);

      res.status(200).json(organization);
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const organizationId = req.params.organizationId;
      await OrganizationService.delete(organizationId);

      await AuditService.log({
        action: 'DELETE',
        entity: 'Organization',
        entityId: organizationId,
        actorId: (req as any).user.userId,
        organizationId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      NotificationService.emitOrganizationUpdated(organizationId, { deleted: true, id: organizationId });

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}
