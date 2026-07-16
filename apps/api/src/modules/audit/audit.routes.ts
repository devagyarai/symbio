import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router: Router = Router();

router.use(authenticate);

router.get('/', AuditController.getLogs);

export default router;
