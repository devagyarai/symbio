import { PrismaClient, SystemRole, OrgRole, WorkspaceRole } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Clearing database...');
  
  // Clear the database safely taking into account foreign keys
  // Order matters due to foreign keys, or we can use clean commands depending on db
  // For safety, we delete top-level models that cascade down
  await prisma.user.deleteMany();
  await prisma.organization.deleteMany();
  
  console.log('Seeding Alice Admin...');
  const user = await prisma.user.create({
    data: {
      email: 'alice@symbio.com',
      name: 'Alice Admin',
      systemRole: SystemRole.SUPER_ADMIN,
    },
  });

  console.log('Seeding Acme Corp Organization...');
  const org = await prisma.organization.create({
    data: {
      name: 'Acme Corp',
      slug: 'acme-corp',
    },
  });

  console.log('Seeding Alice Membership in Acme Corp...');
  await prisma.organizationMembership.create({
    data: {
      userId: user.id,
      organizationId: org.id,
      role: OrgRole.OWNER,
    },
  });

  console.log('Seeding Engineering Team Workspace...');
  const workspace = await prisma.workspace.create({
    data: {
      organizationId: org.id,
      name: 'Engineering Team',
      slug: 'engineering-team',
    },
  });

  console.log('Seeding Alice Membership in Engineering Team...');
  await prisma.workspaceMembership.create({
    data: {
      userId: user.id,
      workspaceId: workspace.id,
      role: WorkspaceRole.ADMIN,
    },
  });

  console.log('Seeding complete! 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
