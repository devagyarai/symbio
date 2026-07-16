import { Request, Response, NextFunction } from 'express';
import { WorkspaceMembersService } from './workspace-members.service';
import { AuditService } from '../audit/audit.service';
import { WorkspaceRole } from '@prisma/client';

export class WorkspaceMembersController {
  static async listMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.workspaceId;
      const members = await WorkspaceMembersService.getMembers(workspaceId);
      res.status(200).json(members);
    } catch (error) {
      next(error);
    }
  }

  static async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.workspaceId;
      const { email, role } = req.body;
      const inviterId = (req as any).user.userId;

      if (!email || !role || !Object.values(WorkspaceRole).includes(role)) {
        res.status(400).json({ error: 'Invalid email or role' });
        return;
      }

      const invite = await WorkspaceMembersService.inviteMember(workspaceId, email, role, inviterId);

      await AuditService.log({
        action: 'MEMBER_INVITED',
        entity: 'WorkspaceInvite',
        entityId: invite.id,
        actorId: inviterId,
        workspaceId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        metadata: { email, role }
      });

      res.status(201).json(invite);
    } catch (error) {
      next(error);
    }
  }

  static async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.workspaceId;
      const memberId = req.params.memberId;
      const { role } = req.body;
      const requesterUserId = (req as any).user.userId;

      if (!role || !Object.values(WorkspaceRole).includes(role)) {
        res.status(400).json({ error: 'Invalid role' });
        return;
      }

      const membership = await WorkspaceMembersService.updateMemberRole(workspaceId, memberId, role, requesterUserId);

      await AuditService.log({
        action: 'MEMBER_ROLE_CHANGED',
        entity: 'WorkspaceMembership',
        entityId: memberId,
        actorId: requesterUserId,
        workspaceId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
        metadata: { newRole: role }
      });

      res.status(200).json(membership);
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot modify OWNER')) {
        res.status(403).json({ error: error.message });
        return;
      }
      next(error);
    }
  }

  static async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.params.workspaceId;
      const memberId = req.params.memberId;
      const requesterUserId = (req as any).user.userId;

      await WorkspaceMembersService.removeMember(workspaceId, memberId);

      await AuditService.log({
        action: 'MEMBER_REMOVED',
        entity: 'WorkspaceMembership',
        entityId: memberId,
        actorId: requesterUserId,
        workspaceId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message.includes('Cannot remove OWNER')) {
        res.status(403).json({ error: error.message });
        return;
      }
      next(error);
    }
  }
}
