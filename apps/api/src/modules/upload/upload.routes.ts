import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { UploadController } from './upload.controller';
import { authenticate, requireVerifiedUser } from '../../middleware/auth.middleware';
import { requireWorkspacePermission } from '../../middleware/rbac.middleware';
import { ValidationError } from 'errors';

const router: Router = Router();

router.use(authenticate);
router.use(requireVerifiedUser);

// Configure multer
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Invalid file type. Only JPG, JPEG, PNG, and WEBP are allowed.'));
    }
  },
});

// Helper middleware to handle multer errors gracefully
const multerErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      next(new ValidationError('File is too large. Maximum size is 10MB.'));
    } else {
      next(new ValidationError(`Multer error: ${err.message}`));
    }
  } else if (err) {
    next(err);
  } else {
    next();
  }
};

/**
 * POST /upload/image
 * Accepts multipart/form-data with 'image' field and 'workspaceId' in query string.
 */
router.post(
  '/image',
  requireWorkspacePermission('canEditWorkspace'),
  (req, res, next) => {
    upload.single('image')(req, res, (err) => multerErrorHandler(err, req, res, next));
  },
  UploadController.uploadImage
);

/**
 * DELETE /upload/:id
 * Requires workspaceId in query or body.
 */
router.delete(
  '/:id',
  requireWorkspacePermission('canEditWorkspace'),
  UploadController.deleteImage
);

export default router;
