import { Request, Response, NextFunction } from 'express';
import { AuthService } from './auth.service';
import { RegisterSchema, LoginSchema, ForgotPasswordSchema, ResetPasswordSchema, ResendVerificationSchema } from 'validation';
import { AuditService } from '../modules/audit/audit.service';

const IS_PROD = process.env.NODE_ENV === 'production';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    try {
      const data = RegisterSchema.parse(req.body);
      const result = await AuthService.register(data);

      await AuditService.log({
        action: 'REGISTER',
        entity: 'User',
        entityId: result.userId,
        actorId: result.userId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const data = LoginSchema.parse(req.body);
      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.login(data, ipAddress, userAgent);

      // Set Refresh Token in HttpOnly Cookie
      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: IS_PROD ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      });

      await AuditService.log({
        action: 'LOGIN',
        entity: 'Session',
        entityId: result.user.id, // Using user ID for reference
        actorId: result.user.id,
        ipAddress,
        userAgent,
      });

      res.status(200).json({
        accessToken: result.accessToken,
        user: result.user,
      });
    } catch (error) {
      next(error);
    }
  }

  static async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      if (!refreshToken) {
        res.status(401).json({ error: 'No refresh token provided' });
        return;
      }

      const ipAddress = req.ip || req.socket.remoteAddress;
      const userAgent = req.headers['user-agent'];

      const result = await AuthService.refresh(refreshToken, ipAddress, userAgent);

      res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: IS_PROD ? 'none' : 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      res.status(200).json({
        accessToken: result.accessToken,
      });
    } catch (error) {
      // Clear cookie on failure
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: IS_PROD ? 'none' : 'lax',
      });
      res.status(401).json({ error: 'Invalid or expired refresh token' });
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies.refreshToken;
      let userId: string | undefined;

      // Extract userId from req if authenticated
      if ((req as any).user) {
        userId = (req as any).user.id || (req as any).user.userId;
      }

      if (refreshToken) {
        await AuthService.logout(refreshToken);
      }
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: IS_PROD,
        sameSite: IS_PROD ? 'none' : 'lax',
      });

      await AuditService.log({
        action: 'LOGOUT',
        entity: 'Session',
        entityId: userId || 'unknown',
        actorId: userId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async logoutAll(req: Request, res: Response, next: NextFunction) {
    try {
      // We assume this route is protected by `authenticate` middleware, so req.user exists
      const userId = (req as any).user?.userId;
      if (!userId) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }

      await AuthService.logoutAll(userId);
      res.clearCookie('refreshToken');

      await AuditService.log({
        action: 'LOGOUT_ALL',
        entity: 'Session',
        entityId: userId,
        actorId: userId,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({ message: 'Logged out from all devices' });
    } catch (error) {
      next(error);
    }
  }

  static async verifyEmail(req: Request, res: Response, next: NextFunction) {
    try {
      const token = req.query.token as string;
      if (!token) {
        res.status(400).json({ error: 'Token is required' });
        return;
      }

      const user = await AuthService.verifyEmail(token);

      await AuditService.log({
        action: 'EMAIL_VERIFIED',
        entity: 'User',
        entityId: user.id,
        actorId: user.id,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async resendVerification(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ResendVerificationSchema.parse(req.body);
      
      // We always return success to prevent user enumeration
      try {
        await AuthService.resendVerification(data.email);
      } catch (e) {
        // Log internally if needed, but don't expose error to client
        // unless it's a validation error that we want to surface.
      }

      res.status(200).json({ message: 'If an account exists with that email, a verification link has been sent.' });
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ForgotPasswordSchema.parse(req.body);

      // Always return success to prevent user enumeration
      try {
        await AuthService.forgotPassword(data.email);
      } catch (e) {
        // Silently catch
      }

      res.status(200).json({ message: 'If an account exists with that email, a password reset link has been sent.' });
    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      const data = ResetPasswordSchema.parse(req.body);

      const user = await AuthService.resetPassword(data.token, data.password);

      await AuditService.log({
        action: 'PASSWORD_RESET',
        entity: 'User',
        entityId: user.id,
        actorId: user.id,
        ipAddress: req.ip || req.socket.remoteAddress,
        userAgent: req.headers['user-agent'],
      });

      res.status(200).json({ message: 'Password has been reset successfully. Please log in with your new password.' });
    } catch (error) {
      next(error);
    }
  }
}
