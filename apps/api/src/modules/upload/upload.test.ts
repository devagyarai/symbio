import request from 'supertest';
import express from 'express';
import uploadRoutes from '../upload/upload.routes';
import { errorHandler } from '../../middleware/error';

// Mock AuditService
jest.mock('../../modules/audit/audit.service', () => ({
  AuditService: {
    log: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock NotificationService
jest.mock('../../socket/notification.service', () => ({
  NotificationService: {
    emitFileUploaded: jest.fn(),
    emitFileDeleted: jest.fn(),
  },
}));

// Mock dependencies
jest.mock('../../middleware/auth.middleware', () => ({
  authenticate: (req: any, res: any, next: any) => {
    req.user = { userId: 'user-123' };
    next();
  },
}));

jest.mock('../../middleware/rbac.middleware', () => ({
  requireWorkspacePermission: () => (req: any, res: any, next: any) => next(),
}));

jest.mock('../upload/upload.service', () => ({
  UploadService: {
    uploadImage: jest.fn().mockResolvedValue({
      id: 'asset-123',
      workspaceId: 'workspace-123',
      url: 'https://cloudinary.com/test-image.jpg',
    }),
    deleteImage: jest.fn().mockResolvedValue({ success: true }),
  },
}));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/upload', uploadRoutes);
app.use(errorHandler);

describe('Upload Module', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /upload/image', () => {
    it('should upload an image successfully', async () => {
      const response = await request(app)
        .post('/upload/image')
        .field('workspaceId', 'workspace-123')
        .attach('image', Buffer.from('fake-image-content'), {
          filename: 'test.jpg',
          contentType: 'image/jpeg',
        });

      expect(response.status).toBe(201);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.id).toBe('asset-123');
    });

    it('should reject invalid file types', async () => {
      const response = await request(app)
        .post('/upload/image')
        .field('workspaceId', 'workspace-123')
        .attach('image', Buffer.from('fake-text-content'), {
          filename: 'test.txt',
          contentType: 'text/plain',
        });

      expect(response.status).toBe(422); // Validation error
      expect(response.body.error.message).toContain('Invalid file type');
    });
  });

  describe('DELETE /upload/:id', () => {
    it('should delete an image successfully', async () => {
      const response = await request(app)
        .delete('/upload/asset-123?workspaceId=workspace-123');

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Image deleted successfully');
    });

    it('should require workspaceId to delete', async () => {
      const response = await request(app)
        .delete('/upload/asset-123');

      expect(response.status).toBe(422); // Validation error
      expect(response.body.error.message).toBe('workspaceId is required');
    });
  });
});
