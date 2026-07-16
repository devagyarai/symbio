import { Router } from 'express';
import { WorkspaceController } from './workspace.controller';
import { authenticate, requireVerifiedUser } from '../../middleware/auth.middleware';
import { requireOrgPermission, requireWorkspacePermission } from '../../middleware/rbac.middleware';

const router: Router = Router();

router.use(authenticate);
router.use(requireVerifiedUser);

// Note: organizationId must be passed in the body for the middleware to pick it up and check OrgPermission
router.post(
  '/',
  requireOrgPermission('canEditOrganization'),
  WorkspaceController.create
);

router.get('/', WorkspaceController.findAll);

router.get(
  '/:workspaceId',
  requireWorkspacePermission('canViewWorkspace'),
  WorkspaceController.findOne
);

router.patch(
  '/:workspaceId',
  requireWorkspacePermission('canEditWorkspace'),
  WorkspaceController.update
);

router.delete(
  '/:workspaceId',
  requireWorkspacePermission('canDeleteWorkspace'),
  WorkspaceController.delete
);

export default router;
