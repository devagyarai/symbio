import { PrismaClient, WorkspaceRole, Prisma } from '@prisma/client';
import { CreateWorkspaceInput, UpdateWorkspaceInput, PaginationQuery } from 'validation';
import { NotFoundError, ConflictError } from 'errors';

const prisma = new PrismaClient();

export class WorkspaceService {
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.floor(Math.random() * 10000);
  }

  static async create(userId: string, data: CreateWorkspaceInput) {
    const slug = data.slug || this.generateSlug(data.name);

    // Check slug uniqueness within organization
    const existing = await prisma.workspace.findUnique({
      where: {
        organizationId_slug: {
          organizationId: data.organizationId,
          slug,
        },
      },
    });

    if (existing) {
      throw new ConflictError('Workspace with this slug already exists in the organization');
    }

    return prisma.workspace.create({
      data: {
        name: data.name,
        slug,
        organizationId: data.organizationId,
        memberships: {
          create: {
            userId,
            role: WorkspaceRole.ADMIN,
          },
        },
      },
    });
  }

  static async findAll(userId: string, query: PaginationQuery) {
    const { page, limit, sortBy, sortOrder, q, organizationId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.WorkspaceWhereInput = {
      memberships: {
        some: { userId },
      },
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
      ...(organizationId ? { organizationId } : {}),
    };

    const [total, data] = await Promise.all([
      prisma.workspace.count({ where }),
      prisma.workspace.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  static async findOne(userId: string, workspaceId: string) {
    const workspace = await prisma.workspace.findFirst({
      where: {
        id: workspaceId,
        memberships: {
          some: { userId },
        },
      },
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    return workspace;
  }

  static async update(workspaceId: string, data: UpdateWorkspaceInput) {
    const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });
    if (!workspace) throw new NotFoundError('Workspace not found');

    if (data.slug) {
      const existing = await prisma.workspace.findUnique({
        where: {
          organizationId_slug: {
            organizationId: workspace.organizationId,
            slug: data.slug,
          },
        },
      });
      if (existing && existing.id !== workspaceId) {
        throw new ConflictError('Workspace with this slug already exists in the organization');
      }
    }

    return prisma.workspace.update({
      where: { id: workspaceId },
      data,
    });
  }

  static async delete(workspaceId: string) {
    try {
      await prisma.workspace.delete({
        where: { id: workspaceId },
      });
    } catch (error) {
      throw new NotFoundError('Workspace not found');
    }
  }
}
