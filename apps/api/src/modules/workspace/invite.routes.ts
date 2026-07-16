import { Router } from 'express';
import { WorkspaceInvitesController } from './workspace-invites.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router: Router = Router();

router.get('/:token', WorkspaceInvitesController.getInvite);
router.post('/:token/accept', authenticate, WorkspaceInvitesController.acceptInvite);

export default router;
