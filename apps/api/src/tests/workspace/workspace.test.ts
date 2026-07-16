import { WorkspaceService } from '../../modules/workspace/workspace.service';
import { OrganizationService } from '../../modules/organization/organization.service';
import { PrismaClient, WorkspaceRole } from '@prisma/client';
import { ConflictError, NotFoundError } from 'errors';

const prisma = new PrismaClient();

describe.skip('WorkspaceService', () => {
  let user: any;
  let org: any;
  let ws1: any;

  beforeAll(async () => {
    await prisma.workspace.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();

    user = await prisma.user.create({
      data: { email: 'wstest1@example.com', name: 'User 1' },
    });

    org = await OrganizationService.create(user.id, {
      name: 'WS Test Org',
      slug: 'ws-test-org',
    });
  });

  afterAll(async () => {
    await prisma.workspace.deleteMany();
    await prisma.organization.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  it('should create a workspace and add user as ADMIN', async () => {
    const workspace = await WorkspaceService.create(user.id, {
      organizationId: org.id,
      name: 'Test Workspace',
      slug: 'test-ws-123',
    });

    expect(workspace).toBeDefined();
    expect(workspace.name).toBe('Test Workspace');
    expect(workspace.organizationId).toBe(org.id);

    const membership = await prisma.workspaceMembership.findFirst({
      where: { workspaceId: workspace.id, userId: user.id },
    });

    expect(membership).toBeDefined();
    expect(membership?.role).toBe(WorkspaceRole.ADMIN);

    ws1 = workspace;
  });

  it('should auto-generate a slug if omitted', async () => {
    const workspace = await WorkspaceService.create(user.id, {
      organizationId: org.id,
      name: 'Auto Slug WS',
    });

    expect(workspace.slug).toMatch(/^auto-slug-ws-\d+$/);
  });

  it('should reject creation if slug is a duplicate in the same org', async () => {
    await expect(
      WorkspaceService.create(user.id, {
        organizationId: org.id,
        name: 'Duplicate Slug WS',
        slug: 'test-ws-123',
      })
    ).rejects.toThrow(ConflictError);
  });

  it('should find all workspaces for a user', async () => {
    const result = await WorkspaceService.findAll(user.id, {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    });

    expect(result.data.length).toBeGreaterThanOrEqual(2);
  });

  it('should filter workspaces by organizationId', async () => {
    const org2 = await OrganizationService.create(user.id, { name: 'Org 2' });
    await WorkspaceService.create(user.id, { organizationId: org2.id, name: 'Org 2 WS' });

    const result = await WorkspaceService.findAll(user.id, {
      page: 1,
      limit: 10,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      organizationId: org.id,
    });

    // Should not include the workspace from org2
    expect(result.data.every((ws) => ws.organizationId === org.id)).toBe(true);
  });

  it('should find one workspace by ID', async () => {
    const workspace = await WorkspaceService.findOne(user.id, ws1.id);
    expect(workspace.id).toBe(ws1.id);
  });

  it('should update a workspace', async () => {
    const updated = await WorkspaceService.update(ws1.id, {
      name: 'Updated Test WS',
    });

    expect(updated.name).toBe('Updated Test WS');
  });

  it('should reject update if new slug conflicts in same org', async () => {
    const ws2 = await WorkspaceService.create(user.id, {
      organizationId: org.id,
      name: 'Temp WS',
      slug: 'temp-ws',
    });

    await expect(
      WorkspaceService.update(ws1.id, {
        slug: 'temp-ws',
      })
    ).rejects.toThrow(ConflictError);
  });

  it('should delete a workspace', async () => {
    await WorkspaceService.delete(ws1.id);

    await expect(WorkspaceService.findOne(user.id, ws1.id)).rejects.toThrow(NotFoundError);
  });
});
