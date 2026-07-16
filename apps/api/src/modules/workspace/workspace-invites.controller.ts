import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuditService } from '../audit/audit.service';

const prisma = new PrismaClient();

export class WorkspaceInvitesController {
  static async getInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token;
      
      const invite = await prisma.workspaceInvite.findUnique({
        where: { token },
        include: {
          workspace: {
            select: { name: true, slug: true }
          },
          inviter: {
            select: { name: true, email: true }
          }
        }
      });

      if (!invite) {
        res.status(404).json({ error: 'Invite not found' });
        return;
      }

      if (invite.expiresAt < new Date()) {
        res.status(400).json({ error: 'Invite expired' });
        return;
      }

      res.status(200).json(invite);
    } catch (error) {
      next(error);
    }
  }

  static async acceptInvite(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.params.token;
      const userId = (req as any).user.userId;

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      const invite = await prisma.workspaceInvite.findUnique({
        where: { token }
      });

      if (!invite) {
        res.status(404).json({ error: 'Invite not found' });
        return;
      }

      if (invite.expiresAt < new Date()) {
        res.status(400).json({ error: 'Invite expired' });
        return;
      }

      if (invite.email !== user.email) {
        res.status(403).json({ error: 'Invite email does not match user email' });
        return;
      }

      // Start transaction
      const membership = await prisma.$transaction(async (tx) => {
        const mem = await tx.workspaceMembership.create({
          data: {
            workspaceId: invite.workspaceId,
            userId: user.id,
            role: invite.role,
          }
        });

        await tx.workspaceInvite.delete({
          where: { id: invite.id }
        });

        return mem;
      });

      await AuditService.log({
        action: 'INVITE_ACCEPTED',
        entity: 'WorkspaceMembership',
        entityId: membership.id,
        actorId: user.id,
        workspaceId: invite.workspaceId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json(membership);
    } catch (error) {
      next(error);
    }
  }
}
