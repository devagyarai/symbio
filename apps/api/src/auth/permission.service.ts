import { PrismaClient, OrgRole, WorkspaceRole, SystemRole } from '@prisma/client';

const prisma = new PrismaClient();

// -----------------------------------------------------------------------------
// Permission Definitions
// -----------------------------------------------------------------------------

export type OrganizationPermission =
  | 'canViewOrganization'
  | 'canEditOrganization'
  | 'canDeleteOrganization'
  | 'canInviteUsers'
  | 'canManageMembers';

export type WorkspacePermission =
  | 'canViewWorkspace'
  | 'canEditWorkspace'
  | 'canDeleteWorkspace'
  | 'canManageMembers'
  | 'canInviteMembers';

// -----------------------------------------------------------------------------
// Permission Matrices
// -----------------------------------------------------------------------------

const ORG_ROLE_PERMISSIONS: Record<OrgRole, Set<OrganizationPermission>> = {
  OWNER: new Set([
    'canViewOrganization',
    'canEditOrganization',
    'canDeleteOrganization',
    'canInviteUsers',
    'canManageMembers',
  ]),
  ADMIN: new Set([
    'canViewOrganization',
    'canEditOrganization',
    'canInviteUsers',
    'canManageMembers',
  ]),
  MEMBER: new Set([
    'canViewOrganization',
  ]),
  GUEST: new Set([
    'canViewOrganization',
  ]),
};

const WORKSPACE_ROLE_PERMISSIONS: Record<WorkspaceRole, Set<WorkspacePermission>> = {
  OWNER: new Set([
    'canViewWorkspace',
    'canEditWorkspace',
    'canDeleteWorkspace',
    'canManageMembers',
    'canInviteMembers',
  ]),
  ADMIN: new Set([
    'canViewWorkspace',
    'canEditWorkspace',
    'canManageMembers',
    'canInviteMembers',
  ]),
  EDITOR: new Set([
    'canViewWorkspace',
    'canEditWorkspace',
  ]),
  VIEWER: new Set([
    'canViewWorkspace',
  ]),
};

// -----------------------------------------------------------------------------
// Role Hierarchies (for standard role checking)
// -----------------------------------------------------------------------------

// Higher index = higher privilege
const SYSTEM_ROLE_HIERARCHY: SystemRole[] = [SystemRole.USER, SystemRole.SUPER_ADMIN];
const ORG_ROLE_HIERARCHY: OrgRole[] = [OrgRole.GUEST, OrgRole.MEMBER, OrgRole.ADMIN, OrgRole.OWNER];
const WORKSPACE_ROLE_HIERARCHY: WorkspaceRole[] = [WorkspaceRole.VIEWER, WorkspaceRole.EDITOR, WorkspaceRole.ADMIN, WorkspaceRole.OWNER];

// -----------------------------------------------------------------------------
// Permission Service
// -----------------------------------------------------------------------------

export class PermissionService {
  
  // --- Static Synchronous Checks ---

  /**
   * Checks if a user's system role meets or exceeds the required role.
   */
  static hasSystemRole(userRole: SystemRole, requiredRole: SystemRole): boolean {
    return SYSTEM_ROLE_HIERARCHY.indexOf(userRole) >= SYSTEM_ROLE_HIERARCHY.indexOf(requiredRole);
  }

  /**
   * Checks if an organization role meets or exceeds the required role.
   */
  static hasOrgRole(userRole: OrgRole, requiredRole: OrgRole): boolean {
    return ORG_ROLE_HIERARCHY.indexOf(userRole) >= ORG_ROLE_HIERARCHY.indexOf(requiredRole);
  }

  /**
   * Checks if a workspace role meets or exceeds the required role.
   */
  static hasWorkspaceRole(userRole: WorkspaceRole, requiredRole: WorkspaceRole): boolean {
    return WORKSPACE_ROLE_HIERARCHY.indexOf(userRole) >= WORKSPACE_ROLE_HIERARCHY.indexOf(requiredRole);
  }

  /**
   * Checks if a given organization role grants a specific permission.
   */
  static hasOrgPermission(role: OrgRole, permission: OrganizationPermission): boolean {
    return ORG_ROLE_PERMISSIONS[role].has(permission);
  }

  /**
   * Checks if a given workspace role grants a specific permission.
   */
  static hasWorkspacePermission(role: WorkspaceRole, permission: WorkspacePermission): boolean {
    return WORKSPACE_ROLE_PERMISSIONS[role].has(permission);
  }

  // --- Database Checks ---

  /**
   * Verifies if a user has a specific SystemRole.
   */
  static async verifySystemRole(userId: string, requiredRole: SystemRole): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { systemRole: true },
    });

    if (!user) return false;
    return this.hasSystemRole(user.systemRole, requiredRole);
  }

  /**
   * Verifies if a user has a specific OrgRole in an organization.
   * SUPER_ADMIN implicitly bypasses this check.
   */
  static async verifyOrgRole(userId: string, organizationId: string, requiredRole: OrgRole): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orgMemberships: {
          where: { organizationId },
        },
      },
    });

    if (!user) return false;
    if (user.systemRole === SystemRole.SUPER_ADMIN) return true;
    
    const membership = user.orgMemberships[0];
    if (!membership) return false;

    return this.hasOrgRole(membership.role, requiredRole);
  }

  /**
   * Verifies if a user has a specific WorkspaceRole in a workspace.
   * SUPER_ADMIN implicitly bypasses this check.
   */
  static async verifyWorkspaceRole(userId: string, workspaceId: string, requiredRole: WorkspaceRole): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workspaceMemberships: {
          where: { workspaceId },
        },
      },
    });

    if (!user) return false;
    if (user.systemRole === SystemRole.SUPER_ADMIN) return true;

    const membership = user.workspaceMemberships[0];
    if (!membership) return false;

    return this.hasWorkspaceRole(membership.role, requiredRole);
  }

  /**
   * Verifies if a user has a specific Organization Permission.
   * SUPER_ADMIN implicitly bypasses this check.
   */
  static async verifyOrgPermission(userId: string, organizationId: string, permission: OrganizationPermission): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        orgMemberships: {
          where: { organizationId },
        },
      },
    });

    if (!user) return false;
    if (user.systemRole === SystemRole.SUPER_ADMIN) return true;
    
    const membership = user.orgMemberships[0];
    if (!membership) return false;

    return this.hasOrgPermission(membership.role, permission);
  }

  /**
   * Verifies if a user has a specific Workspace Permission.
   * SUPER_ADMIN implicitly bypasses this check.
   */
  static async verifyWorkspacePermission(userId: string, workspaceId: string, permission: WorkspacePermission): Promise<boolean> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        workspaceMemberships: {
          where: { workspaceId },
        },
      },
    });

    if (!user) return false;
    if (user.systemRole === SystemRole.SUPER_ADMIN) return true;

    const membership = user.workspaceMemberships[0];
    if (!membership) return false;

    return this.hasWorkspacePermission(membership.role, permission);
  }
}
