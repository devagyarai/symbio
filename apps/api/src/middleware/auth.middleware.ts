import { Request, Response, NextFunction } from 'express';
import { JwtUtil } from '../utils/jwt.util';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Middleware to extract and verify the JWT access token.
 */
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
      return;
    }

    const token = authHeader.split(' ')[1];
    const payload = JwtUtil.verifyAccessToken(token);

    // Attach user payload to request
    (req as any).user = payload;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Unauthorized: Token invalid or expired' });
  }
};

/**
 * Middleware to ensure the authenticated user has a verified email.
 * Must be used AFTER `authenticate`.
 */
export const requireVerifiedUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payload = (req as any).user;
    if (!payload || !payload.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { emailVerified: true },
    });

    if (!user || !user.emailVerified) {
      res.status(403).json({ error: 'Forbidden: Email not verified' });
      return;
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Middleware to mitigate simple form-based CSRF attacks on mutating endpoints.
 * Requires the client to send 'Content-Type: application/json' for POST requests.
 */
export const requireAjax = (req: Request, res: Response, next: NextFunction) => {
  if (req.method === 'POST' && !req.headers['content-type']?.includes('application/json')) {
    res.status(415).json({ error: 'Unsupported Media Type: application/json required' });
    return;
  }
  next();
};
