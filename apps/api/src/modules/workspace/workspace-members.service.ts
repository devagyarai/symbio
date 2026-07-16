import { PrismaClient, WorkspaceRole } from '@prisma/client';
import { randomBytes } from 'crypto';

const prisma = new PrismaClient();

export class WorkspaceMembersService {
  static async getMembers(workspaceId: string) {
    return prisma.workspaceMembership.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  static async updateMemberRole(workspaceId: string, memberId: string, newRole: WorkspaceRole, requesterUserId: string) {
    // Check if member exists
    const membership = await prisma.workspaceMembership.findUnique({
      where: { id: memberId }
    });
    
    if (!membership || membership.workspaceId !== workspaceId) {
      throw new Error('Member not found');
    }

    if (membership.role === WorkspaceRole.OWNER) {
      throw new Error('Cannot modify OWNER role');
    }

    // Update
    return prisma.workspaceMembership.update({
      where: { id: memberId },
      data: { role: newRole }
    });
  }

  static async removeMember(workspaceId: string, memberId: string) {
    const membership = await prisma.workspaceMembership.findUnique({
      where: { id: memberId }
    });

    if (!membership || membership.workspaceId !== workspaceId) {
      throw new Error('Member not found');
    }

    if (membership.role === WorkspaceRole.OWNER) {
      throw new Error('Cannot remove OWNER');
    }

    await prisma.workspaceMembership.delete({
      where: { id: memberId }
    });
  }

  static async inviteMember(workspaceId: string, email: string, role: WorkspaceRole, inviterId: string) {
    // Check if user is already a member
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      const existingMembership = await prisma.workspaceMembership.findFirst({
        where: { workspaceId, userId: existingUser.id }
      });
      if (existingMembership) {
        throw new Error('User is already a member of this workspace');
      }
    }

    // Check if invite already exists
    const existingInvite = await prisma.workspaceInvite.findFirst({
      where: { workspaceId, email }
    });
    if (existingInvite) {
      throw new Error('User is already invited');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.workspaceInvite.create({
      data: {
        workspaceId,
        email,
        role,
        invitedBy: inviterId,
        token,
        expiresAt
      }
    });

    return invite;
  }
}
