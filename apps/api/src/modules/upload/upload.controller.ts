import { Request, Response, NextFunction } from 'express';
import { UploadService } from './upload.service';
import { ValidationError } from 'errors';
import { AuditService } from '../audit/audit.service';
import { NotificationService } from '../../socket/notification.service';

export class UploadController {
  static async uploadImage(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      if (!file) {
        throw new ValidationError('No image file provided');
      }

      const workspaceId = (req.query.workspaceId as string) || req.body.workspaceId;
      if (!workspaceId) {
        throw new ValidationError('workspaceId is required');
      }

      const userId = (req as any).user.userId;

      const fileAsset = await UploadService.uploadImage(file, workspaceId, userId);
      
      await AuditService.log({
        action: 'UPLOAD_IMAGE',
        entity: 'FileAsset',
        entityId: fileAsset.id,
        actorId: userId,
        workspaceId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      NotificationService.emitFileUploaded(workspaceId, fileAsset as any);

      res.status(201).json({
        data: fileAsset,
        message: 'Image uploaded successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteImage(req: Request, res: Response, next: NextFunction) {
    try {
      const fileAssetId = req.params.id;
      // Depending on routing, workspaceId might come from query or body.
      // Let's assume it is passed in query for a DELETE request, as DELETE bodies are non-standard.
      const workspaceId = (req.query.workspaceId as string) || req.body.workspaceId;
      
      if (!workspaceId) {
        throw new ValidationError('workspaceId is required');
      }

      await UploadService.deleteImage(fileAssetId, workspaceId);

      await AuditService.log({
        action: 'DELETE_IMAGE',
        entity: 'FileAsset',
        entityId: fileAssetId,
        actorId: (req as any).user.userId,
        workspaceId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      NotificationService.emitFileDeleted(workspaceId, fileAssetId);

      res.status(200).json({
        message: 'Image deleted successfully'
      });
    } catch (error) {
      next(error);
    }
  }
}
