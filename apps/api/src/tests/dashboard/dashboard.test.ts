import request from 'supertest';
import express from 'express';
import dashboardRoutes from '../../modules/dashboard/dashboard.routes';
import { errorHandler } from '../../middleware/error';

// ── Mocks ─────────────────────────────────────────────────────────────────────

// Auth middleware — user identity controlled via Authorization header value
jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: (req: any, _res: any, next: any) => {
    const auth = req.headers.authorization;
    if (auth === 'Bearer superadmin') {
      req.user = { userId: 'admin-1', systemRole: 'SUPER_ADMIN' };
    } else if (auth === 'Bearer orgowner') {
      req.user = { userId: 'owner-1', systemRole: 'USER' };
    } else if (auth === 'Bearer wsadmin') {
      req.user = { userId: 'wsadmin-1', systemRole: 'USER' };
    } else {
      req.user = { userId: 'member-1', systemRole: 'USER' };
    }
    next();
  },
}));

// PermissionService — controls who can manage what
jest.mock('../../auth/permission.service', () => ({
  PermissionService: {
    verifyOrgRole: jest.fn().mockImplementation(
      (_userId: string, orgId: string, _role: string) =>
        orgId === '11111111-0000-0000-0000-000000000000',
    ),
    verifyWorkspaceRole: jest.fn().mockImplementation(
      (_userId: string, wsId: string, _role: string) =>
        wsId === '22222222-0000-0000-0000-000000000000',
    ),
  },
}));

// PresenceService
jest.mock('../../socket/presence.service', () => ({
  PresenceService: {
    getAllOnline: jest.fn().mockReturnValue([{ userId: 'u1' }, { userId: 'u2' }]),
    getOnlineUsers: jest.fn().mockReturnValue([{ userId: 'u1' }]),
  },
}));

// DashboardService
// DashboardService — mock data defined inline to avoid jest.mock hoisting issue
jest.mock('../../modules/dashboard/dashboard.service', () => ({
  DashboardService: {
    getOverview: jest.fn().mockResolvedValue({
      totalOrganizations: 5,
      totalWorkspaces: 12,
      totalUsers: 42,
      onlineUsers: 2,
      activeSessions: 8,
      uploadedFiles: 30,
      storageUsed: 1024 * 1024 * 5,
      storageUsedMB: 5,
      auditEventsToday: 17,
    }),
    getActivity: jest.fn().mockResolvedValue({
      recentOrganizations: [{ id: 'o1', name: 'Acme' }],
      recentWorkspaces: [{ id: 'w1', name: 'Engineering' }],
      recentUploads: [],
      recentAuditLogs: [],
      recentLogins: [],
    }),
    getCharts: jest.fn().mockResolvedValue({
      organizationsPerMonth: [],
      workspacesPerMonth: [],
      uploadsPerDay: [],
      auditEventsPerDay: [],
      loginsPerDay: [],
      topActiveWorkspaces: [],
      mostActiveOrganizations: [],
    }),
    getSystemStatus: jest.fn().mockResolvedValue({
      databaseStatus: 'connected',
      cloudinaryStatus: 'configured',
      socketStatus: 'running',
      onlineUsers: 2,
      apiVersion: '0.1.0',
      serverUptime: 3600,
      serverUptimeFormatted: '1h',
      environment: 'test',
      nodeVersion: 'v20.0.0',
      platform: 'linux',
      memoryUsageMB: { heapUsed: 50, heapTotal: 100, rss: 120 },
    }),
  },
}));


// NotificationService
jest.mock('../../socket/notification.service', () => ({
  NotificationService: {
    init: jest.fn(),
    emitToUser: jest.fn(),
  },
}));

// ── App setup ─────────────────────────────────────────────────────────────────

const app = express();
app.use(express.json());
app.use('/dashboard', dashboardRoutes);
app.use(errorHandler);

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Dashboard Routes', () => {
  afterEach(() => jest.clearAllMocks());

  // ── RBAC: /overview ─────────────────────────────────────────────────────────

  describe('GET /dashboard/overview — RBAC', () => {
    it('SUPER_ADMIN → 200 (global, no scope required)', async () => {
      const res = await request(app)
        .get('/dashboard/overview')
        .set('Authorization', 'Bearer superadmin');

      expect(res.status).toBe(200);
      expect(res.body.data.totalOrganizations).toBe(5);
    });

    it('SUPER_ADMIN → 200 with organizationId filter', async () => {
      const res = await request(app)
        .get('/dashboard/overview?organizationId=11111111-0000-0000-0000-000000000000')
        .set('Authorization', 'Bearer superadmin');

      expect(res.status).toBe(200);
    });

    it('Org OWNER with valid orgId → 200', async () => {
      const res = await request(app)
        .get('/dashboard/overview?organizationId=11111111-0000-0000-0000-000000000000')
        .set('Authorization', 'Bearer orgowner');

      expect(res.status).toBe(200);
    });

    it('Org OWNER with invalid orgId → 403', async () => {
      const res = await request(app)
        .get('/dashboard/overview?organizationId=99999999-0000-0000-0000-000000000000')
        .set('Authorization', 'Bearer orgowner');

      expect(res.status).toBe(403);
    });

    it('WS ADMIN with valid workspaceId → 200', async () => {
      const res = await request(app)
        .get('/dashboard/overview?workspaceId=22222222-0000-0000-0000-000000000000')
        .set('Authorization', 'Bearer wsadmin');

      expect(res.status).toBe(200);
    });

    it('WS ADMIN with invalid workspaceId → 403', async () => {
      const res = await request(app)
        .get('/dashboard/overview?workspaceId=99999999-0000-0000-0000-000000000001')
        .set('Authorization', 'Bearer wsadmin');

      expect(res.status).toBe(403);
    });

    it('Regular member without scope → 403', async () => {
      const res = await request(app)
        .get('/dashboard/overview')
        .set('Authorization', 'Bearer member');

      expect(res.status).toBe(403);
    });
  });

  // ── RBAC: /activity ──────────────────────────────────────────────────────────

  describe('GET /dashboard/activity — RBAC', () => {
    it('SUPER_ADMIN → 200', async () => {
      const res = await request(app)
        .get('/dashboard/activity')
        .set('Authorization', 'Bearer superadmin');

      expect(res.status).toBe(200);
      expect(res.body.data.recentOrganizations).toHaveLength(1);
    });

    it('Org OWNER with valid orgId → 200', async () => {
      const res = await request(app)
        .get('/dashboard/activity?organizationId=11111111-0000-0000-0000-000000000000')
        .set('Authorization', 'Bearer orgowner');

      expect(res.status).toBe(200);
    });

    it('Member without scope → 403', async () => {
      const res = await request(app)
        .get('/dashboard/activity')
        .set('Authorization', 'Bearer member');

      expect(res.status).toBe(403);
    });
  });

  // ── RBAC: /charts ────────────────────────────────────────────────────────────

  describe('GET /dashboard/charts — RBAC', () => {
    it('SUPER_ADMIN → 200', async () => {
      const res = await request(app)
        .get('/dashboard/charts')
        .set('Authorization', 'Bearer superadmin');

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty('organizationsPerMonth');
      expect(res.body.data).toHaveProperty('topActiveWorkspaces');
    });

    it('Member without scope → 403', async () => {
      const res = await request(app)
        .get('/dashboard/charts')
        .set('Authorization', 'Bearer member');

      expect(res.status).toBe(403);
    });
  });

  // ── RBAC: /system ────────────────────────────────────────────────────────────

  describe('GET /dashboard/system — RBAC', () => {
    it('SUPER_ADMIN → 200 with system info', async () => {
      const res = await request(app)
        .get('/dashboard/system')
        .set('Authorization', 'Bearer superadmin');

      expect(res.status).toBe(200);
      expect(res.body.data.databaseStatus).toBe('connected');
      expect(res.body.data).toHaveProperty('serverUptime');
      expect(res.body.data).toHaveProperty('memoryUsageMB');
    });

    it('Org OWNER → 403 (system is SUPER_ADMIN only)', async () => {
      const res = await request(app)
        .get('/dashboard/system')
        .set('Authorization', 'Bearer orgowner');

      expect(res.status).toBe(403);
    });

    it('Regular member → 403', async () => {
      const res = await request(app)
        .get('/dashboard/system')
        .set('Authorization', 'Bearer member');

      expect(res.status).toBe(403);
    });
  });

  // ── Response shape validation ─────────────────────────────────────────────

  describe('Response shape', () => {
    it('/overview returns all required fields', async () => {
      const res = await request(app)
        .get('/dashboard/overview')
        .set('Authorization', 'Bearer superadmin');

      const d = res.body.data;
      expect(d).toHaveProperty('totalOrganizations');
      expect(d).toHaveProperty('totalWorkspaces');
      expect(d).toHaveProperty('totalUsers');
      expect(d).toHaveProperty('onlineUsers');
      expect(d).toHaveProperty('activeSessions');
      expect(d).toHaveProperty('uploadedFiles');
      expect(d).toHaveProperty('storageUsed');
      expect(d).toHaveProperty('auditEventsToday');
    });

    it('/activity returns all required fields', async () => {
      const res = await request(app)
        .get('/dashboard/activity')
        .set('Authorization', 'Bearer superadmin');

      const d = res.body.data;
      expect(d).toHaveProperty('recentOrganizations');
      expect(d).toHaveProperty('recentWorkspaces');
      expect(d).toHaveProperty('recentUploads');
      expect(d).toHaveProperty('recentAuditLogs');
      expect(d).toHaveProperty('recentLogins');
    });

    it('/charts returns all required fields', async () => {
      const res = await request(app)
        .get('/dashboard/charts')
        .set('Authorization', 'Bearer superadmin');

      const d = res.body.data;
      expect(d).toHaveProperty('organizationsPerMonth');
      expect(d).toHaveProperty('workspacesPerMonth');
      expect(d).toHaveProperty('uploadsPerDay');
      expect(d).toHaveProperty('auditEventsPerDay');
      expect(d).toHaveProperty('loginsPerDay');
      expect(d).toHaveProperty('topActiveWorkspaces');
      expect(d).toHaveProperty('mostActiveOrganizations');
    });

    it('/system returns all required fields', async () => {
      const res = await request(app)
        .get('/dashboard/system')
        .set('Authorization', 'Bearer superadmin');

      const d = res.body.data;
      expect(d).toHaveProperty('databaseStatus');
      expect(d).toHaveProperty('cloudinaryStatus');
      expect(d).toHaveProperty('socketStatus');
      expect(d).toHaveProperty('apiVersion');
      expect(d).toHaveProperty('serverUptime');
      expect(d).toHaveProperty('environment');
    });
  });
});
