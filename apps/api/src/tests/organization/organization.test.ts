import { OrganizationService } from '../../modules/organization/organization.service';
import { PrismaClient, OrgRole } from '@prisma/client';
import { ConflictError, NotFoundError } from 'errors';

const prisma = new PrismaClient();

describe.skip('OrganizationService', () => {
  let user1: any;
  let user2: any;
  let org1: any;

  beforeAll(async () => {
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();

    user1 = await prisma.user.create({
      data: { email: 'orgtest1@example.com', name: 'User 1' },
    });
    user2 = await prisma.user.create({
      data: { email: 'orgtest2@example.com', name: 'User 2' },
    });
  });

  afterAll(async () => {
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should create an organization and add user as OWNER', async () => {
    const org = await OrganizationService.create(user1.id, {
      name: 'Test Org',
      slug: 'test-org-123',
    });

    expect(org).toBeDefined();
    expect(org.name).toBe('Test Org');
    expect(org.slug).toBe('test-org-123');

    const membership = await prisma.organizationMembership.findFirst({
      where: { organizationId: org.id, userId: user1.id },
    });

    expect(membership).toBeDefined();
    expect(membership?.role).toBe(OrgRole.OWNER);

    org1 = org;
  });

  it('should auto-generate a slug if omitted', async () => {
    const org = await OrganizationService.create(user1.id, {
      name: 'My Auto Slug Org',
    });

    expect(org.slug).toMatch(/^my-auto-slug-org-\d+$/);
  });

  it('should reject creation if slug is a duplicate', async () => {
    await expect(
      OrganizationService.create(user1.id, {
        name: 'Another Org',
        slug: 'test-org-123',
      })
    ).rejects.toThrow(ConflictError);
  });

  it('should find all organizations for a user', async () => {
    const result = await OrganizationService.findAll(user1.id, {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    expect(result.data.length).toBeGreaterThanOrEqual(2);
    expect(result.meta.total).toBeGreaterThanOrEqual(2);
  });

  it('should not return organizations where user is not a member', async () => {
    const result = await OrganizationService.findAll(user2.id, {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    expect(result.data.length).toBe(0);
  });

  it('should find one organization by ID', async () => {
    const org = await OrganizationService.findOne(user1.id, org1.id);
    expect(org.id).toBe(org1.id);
  });

  it('should update an organization', async () => {
    const updated = await OrganizationService.update(org1.id, {
      name: 'Updated Test Org',
    });

    expect(updated.name).toBe('Updated Test Org');
  });

  it('should reject update if new slug conflicts', async () => {
    const org2 = await OrganizationService.create(user1.id, {
      name: 'Temp Org',
      slug: 'temp-slug',
    });

    await expect(
      OrganizationService.update(org1.id, {
        slug: 'temp-slug',
      })
    ).rejects.toThrow(ConflictError);
  });

  it('should delete an organization', async () => {
    await OrganizationService.delete(org1.id);

    await expect(OrganizationService.findOne(user1.id, org1.id)).rejects.toThrow(NotFoundError);
  });
});
