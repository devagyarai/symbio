import { Router } from 'express';
import { authenticate } from '../../middleware/auth.middleware';
import { DashboardController } from './dashboard.controller';

const router: Router = Router();

// All dashboard routes require authentication.
// Fine-grained RBAC is enforced inside the controller via resolveScope().
router.use(authenticate);

/**
 * @route  GET /dashboard/overview
 * @desc   High-level platform counters
 * @access SUPER_ADMIN (global) | Org OWNER (org-scoped) | WS ADMIN (ws-scoped)
 */
router.get('/overview', DashboardController.overview);

/**
 * @route  GET /dashboard/activity
 * @desc   Recent activity feed across entities
 * @access SUPER_ADMIN | Org OWNER | WS ADMIN
 */
router.get('/activity', DashboardController.activity);

/**
 * @route  GET /dashboard/charts
 * @desc   Time-series chart data (30d / 12mo)
 * @access SUPER_ADMIN | Org OWNER | WS ADMIN
 */
router.get('/charts', DashboardController.charts);

/**
 * @route  GET /dashboard/system
 * @desc   Infrastructure health, uptime, memory usage
 * @access SUPER_ADMIN only
 */
router.get('/system', DashboardController.system);

export default router;
