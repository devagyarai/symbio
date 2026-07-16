import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate, requireAjax } from '../middleware/auth.middleware';
import rateLimit from 'express-rate-limit';

const loginLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 5, // 5 requests per IP
  message: { error: 'Too many login attempts, please try again after 5 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const registerLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 requests per IP
  message: { error: 'Too many registration attempts, please try again after 15 minutes' },
  standardHeaders: true,
  legacyHeaders: false,
});

const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per IP
  message: { error: 'Too many password reset requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const resendVerificationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // 3 requests per IP
  message: { error: 'Too many verification requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const verifyEmailLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 requests per IP
  message: { error: 'Too many verification attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const router: Router = Router();

router.post('/register', registerLimiter, AuthController.register);
router.post('/login', loginLimiter, AuthController.login);
router.post('/refresh', requireAjax, AuthController.refresh);
router.post('/logout', requireAjax, AuthController.logout);
router.post('/logout-all', authenticate, requireAjax, AuthController.logoutAll);

// Email Verification
router.get('/verify-email', verifyEmailLimiter, AuthController.verifyEmail);
router.post('/resend-verification', resendVerificationLimiter, AuthController.resendVerification);

// Password Reset
router.post('/forgot-password', forgotPasswordLimiter, AuthController.forgotPassword);
router.post('/reset-password', AuthController.resetPassword);

export default router;
