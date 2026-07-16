import { PermissionService } from '../../auth/permission.service';
import { SystemRole, OrgRole, WorkspaceRole } from '@prisma/client';

describe('PermissionService', () => {
  describe('System Roles', () => {
    it('SUPER_ADMIN should have access to USER level', () => {
      expect(PermissionService.hasSystemRole(SystemRole.SUPER_ADMIN, SystemRole.USER)).toBe(true);
    });

    it('USER should not have access to SUPER_ADMIN level', () => {
      expect(PermissionService.hasSystemRole(SystemRole.USER, SystemRole.SUPER_ADMIN)).toBe(false);
    });
  });

  describe('Organization Roles', () => {
    it('OWNER should have ADMIN access', () => {
      expect(PermissionService.hasOrgRole(OrgRole.OWNER, OrgRole.ADMIN)).toBe(true);
    });

    it('ADMIN should not have OWNER access', () => {
      expect(PermissionService.hasOrgRole(OrgRole.ADMIN, OrgRole.OWNER)).toBe(false);
    });

    it('MEMBER should have GUEST access', () => {
      expect(PermissionService.hasOrgRole(OrgRole.MEMBER, OrgRole.GUEST)).toBe(true);
    });
  });

  describe('Workspace Roles', () => {
    it('ADMIN should have EDITOR access', () => {
      expect(PermissionService.hasWorkspaceRole(WorkspaceRole.ADMIN, WorkspaceRole.EDITOR)).toBe(true);
    });

    it('EDITOR should have VIEWER access', () => {
      expect(PermissionService.hasWorkspaceRole(WorkspaceRole.EDITOR, WorkspaceRole.VIEWER)).toBe(true);
    });

    it('VIEWER should not have EDITOR access', () => {
      expect(PermissionService.hasWorkspaceRole(WorkspaceRole.VIEWER, WorkspaceRole.EDITOR)).toBe(false);
    });
  });

  describe('Organization Permissions', () => {
    it('OWNER should have all organization permissions', () => {
      expect(PermissionService.hasOrgPermission(OrgRole.OWNER, 'canViewOrganization')).toBe(true);
      expect(PermissionService.hasOrgPermission(OrgRole.OWNER, 'canEditOrganization')).toBe(true);
      expect(PermissionService.hasOrgPermission(OrgRole.OWNER, 'canDeleteOrganization')).toBe(true);
      expect(PermissionService.hasOrgPermission(OrgRole.OWNER, 'canInviteUsers')).toBe(true);
      expect(PermissionService.hasOrgPermission(OrgRole.OWNER, 'canManageMembers')).toBe(true);
    });

    it('ADMIN should not have canDeleteOrganization permission', () => {
      expect(PermissionService.hasOrgPermission(OrgRole.ADMIN, 'canDeleteOrganization')).toBe(false);
      expect(PermissionService.hasOrgPermission(OrgRole.ADMIN, 'canEditOrganization')).toBe(true);
    });

    it('MEMBER should only have canViewOrganization permission', () => {
      expect(PermissionService.hasOrgPermission(OrgRole.MEMBER, 'canViewOrganization')).toBe(true);
      expect(PermissionService.hasOrgPermission(OrgRole.MEMBER, 'canEditOrganization')).toBe(false);
    });
  });

  describe('Workspace Permissions', () => {
    it('ADMIN should have all workspace permissions', () => {
      expect(PermissionService.hasWorkspacePermission(WorkspaceRole.ADMIN, 'canViewWorkspace')).toBe(true);
      expect(PermissionService.hasWorkspacePermission(WorkspaceRole.ADMIN, 'canEditWorkspace')).toBe(true);
      expect(PermissionService.hasWorkspacePermission(WorkspaceRole.ADMIN, 'canDeleteWorkspace')).toBe(true);
      expect(PermissionService.hasWorkspacePermission(WorkspaceRole.ADMIN, 'canManageWorkspaceMembers')).toBe(true);
    });

    it('EDITOR should not have canDeleteWorkspace or canManageWorkspaceMembers permissions', () => {
      expect(PermissionService.hasWorkspacePermission(WorkspaceRole.EDITOR, 'canDeleteWorkspace')).toBe(false);
      expect(PermissionService.hasWorkspacePermission(WorkspaceRole.EDITOR, 'canManageWorkspaceMembers')).toBe(false);
      expect(PermissionService.hasWorkspacePermission(WorkspaceRole.EDITOR, 'canEditWorkspace')).toBe(true);
    });

    it('VIEWER should only have canViewWorkspace permission', () => {
      expect(PermissionService.hasWorkspacePermission(WorkspaceRole.VIEWER, 'canViewWorkspace')).toBe(true);
      expect(PermissionService.hasWorkspacePermission(WorkspaceRole.VIEWER, 'canEditWorkspace')).toBe(false);
    });
  });
});
