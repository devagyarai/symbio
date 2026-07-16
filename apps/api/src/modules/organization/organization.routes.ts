import { Router } from 'express';
import { OrganizationController } from './organization.controller';
import { authenticate, requireVerifiedUser } from '../../middleware/auth.middleware';
import { requireOrgPermission } from '../../middleware/rbac.middleware';

const router: Router = Router();

router.use(authenticate);
router.use(requireVerifiedUser);

router.post('/', OrganizationController.create);
router.get('/', OrganizationController.findAll);

router.get(
  '/:organizationId',
  requireOrgPermission('canViewOrganization'),
  OrganizationController.findOne
);

router.patch(
  '/:organizationId',
  requireOrgPermission('canEditOrganization'),
  OrganizationController.update
);

router.delete(
  '/:organizationId',
  requireOrgPermission('canDeleteOrganization'),
  OrganizationController.delete
);

export default router;
