import { PrismaClient, OrgRole, Prisma } from '@prisma/client';
import { CreateOrganizationInput, UpdateOrganizationInput, PaginationQuery } from 'validation';
import { NotFoundError, ConflictError } from 'errors';

const prisma = new PrismaClient();

export class OrganizationService {
  /**
   * Automatically generates a slug from a name if not provided.
   */
  private static generateSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '') + '-' + Math.floor(Math.random() * 10000);
  }

  static async create(userId: string, data: CreateOrganizationInput) {
    const slug = data.slug || this.generateSlug(data.name);

    // Check slug uniqueness
    const existing = await prisma.organization.findUnique({ where: { slug } });
    if (existing) {
      throw new ConflictError('Organization with this slug already exists');
    }

    return prisma.organization.create({
      data: {
        name: data.name,
        slug,
        logoUrl: data.logoUrl,
        memberships: {
          create: {
            userId,
            role: OrgRole.OWNER,
          },
        },
      },
    });
  }

  static async findAll(userId: string, query: PaginationQuery) {
    const { page, limit, sortBy, sortOrder, q } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.OrganizationWhereInput = {
      memberships: {
        some: { userId },
      },
      ...(q ? { name: { contains: q, mode: 'insensitive' } } : {}),
    };

    const [total, data] = await Promise.all([
      prisma.organization.count({ where }),
      prisma.organization.findMany({
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

  static async findOne(userId: string, organizationId: string) {
    const organization = await prisma.organization.findFirst({
      where: {
        id: organizationId,
        memberships: {
          some: { userId },
        },
      },
    });

    if (!organization) {
      throw new NotFoundError('Organization not found');
    }

    return organization;
  }

  static async update(organizationId: string, data: UpdateOrganizationInput) {
    if (data.slug) {
      const existing = await prisma.organization.findUnique({ where: { slug: data.slug } });
      if (existing && existing.id !== organizationId) {
        throw new ConflictError('Organization with this slug already exists');
      }
    }

    try {
      return await prisma.organization.update({
        where: { id: organizationId },
        data,
      });
    } catch (error) {
      throw new NotFoundError('Organization not found');
    }
  }

  static async delete(organizationId: string) {
    try {
      await prisma.organization.delete({
        where: { id: organizationId },
      });
    } catch (error) {
      throw new NotFoundError('Organization not found');
    }
  }
}
