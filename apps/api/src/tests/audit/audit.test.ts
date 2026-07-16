import request from 'supertest';
import express from 'express';
import auditRoutes from '../../modules/audit/audit.routes';
import { errorHandler } from '../../middleware/error';

const app = express();
app.use(express.json());

// Mock Auth Middleware
jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    // Basic mock logic: check the header to simulate different users
    const authHeader = req.headers.authorization;
    if (authHeader === 'Bearer superadmin') {
      req.user = { userId: 'admin123', id: 'admin123', systemRole: 'SUPER_ADMIN' };
    } else {
      req.user = { userId: 'user123', id: 'user123', systemRole: 'USER' };
    }
    next();
  },
}));

// Mock RBAC Middleware PermissionService
jest.mock('../../auth/permission.service', () => ({
  PermissionService: {
    verifyWorkspaceRole: jest.fn().mockImplementation((userId, workspaceId, role) => {
      // Simulate only letting "user123" manage "11111111-1111-1111-1111-111111111111"
      return userId === 'user123' && workspaceId === '11111111-1111-1111-1111-111111111111';
    }),
    verifyOrgRole: jest.fn().mockImplementation((userId, orgId, role) => {
      // Simulate only letting "user123" manage "22222222-2222-2222-2222-222222222222"
      return userId === 'user123' && orgId === '22222222-2222-2222-2222-222222222222';
    }),
  },
}));

// Mock AuditService
jest.mock('../../modules/audit/audit.service', () => ({
  AuditService: {
    getLogs: jest.fn().mockResolvedValue({
      data: [{ id: 'log-1' }],
      meta: { total: 1, page: 1, limit: 20, totalPages: 1 },
    }),
    log: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock NotificationService
jest.mock('../../socket/notification.service', () => ({
  NotificationService: {
    emitOrganizationUpdated: jest.fn(),
    emitWorkspaceUpdated: jest.fn(),
    emitFileUploaded: jest.fn(),
    emitFileDeleted: jest.fn(),
    emitActivityLogged: jest.fn(),
    emitToUser: jest.fn(),
  },
}));

app.use('/audit', auditRoutes);
app.use(errorHandler);

describe('Audit Routes', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should allow SUPER_ADMIN to get all logs', async () => {
    const res = await request(app)
      .get('/audit')
      .set('Authorization', 'Bearer superadmin');

    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('log-1');
  });

  it('should reject normal USER from getting global logs', async () => {
    const res = await request(app)
      .get('/audit')
      .set('Authorization', 'Bearer user');

    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe('Only super admins can view global audit logs');
  });

  it('should allow Workspace ADMIN to get workspace logs', async () => {
    const res = await request(app)
      .get('/audit?workspaceId=11111111-1111-1111-1111-111111111111')
      .set('Authorization', 'Bearer user');

    expect(res.status).toBe(200);
  });

  it('should reject Workspace MEMBER from getting workspace logs', async () => {
    const res = await request(app)
      .get('/audit?workspaceId=11111111-1111-1111-1111-111111111112')
      .set('Authorization', 'Bearer user');

    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe('Only workspace admins can view workspace audit logs');
  });

  it('should allow Organization OWNER to get organization logs', async () => {
    const res = await request(app)
      .get('/audit?organizationId=22222222-2222-2222-2222-222222222222')
      .set('Authorization', 'Bearer user');

    expect(res.status).toBe(200);
  });

  it('should reject Organization MEMBER from getting organization logs', async () => {
    const res = await request(app)
      .get('/audit?organizationId=22222222-2222-2222-2222-222222222223')
      .set('Authorization', 'Bearer user');

    expect(res.status).toBe(403);
    expect(res.body.error.message).toBe('Only organization owners can view organization audit logs');
  });
});
