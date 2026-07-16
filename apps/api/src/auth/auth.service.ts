import { PrismaClient, SessionStatus } from '@prisma/client';
import { RegisterInput, LoginInput } from 'validation';
import { HashUtil } from '../utils/hash.util';
import { JwtUtil } from '../utils/jwt.util';
import { EmailService } from '../services/email.service';
import crypto from 'crypto';

const prisma = new PrismaClient();

export class AuthService {
  /**
   * Registers a new user.
   */
  static async register(data: RegisterInput) {
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      throw new Error('User already exists');
    }

    const hashedPassword = await HashUtil.hash(data.password);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        password: hashedPassword,
      },
    });

    // Create Verification Token
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        email: user.email,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send Verification Email
    await EmailService.sendVerificationEmail(user.email, token);

    return {
      message: 'Registration successful. Please check your email to verify your account.',
      userId: user.id,
    };
  }

  /**
   * Authenticates a user and issues tokens.
   */
  static async login(data: LoginInput, ipAddress?: string, userAgent?: string) {
    const user = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !user.password) {
      throw new Error('Invalid email or password');
    }

    const isValid = await HashUtil.compare(data.password, user.password);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const payload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      systemRole: user.systemRole,
    };

    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken(payload);

    // Store Refresh Token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Store Session
    await prisma.session.create({
      data: {
        userId: user.id,
        token: refreshToken, // Use refresh token as session identifier
        ipAddress,
        userAgent,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        systemRole: user.systemRole,
      },
    };
  }

  /**
   * Refreshes access and refresh tokens using a valid refresh token.
   */
  static async refresh(oldRefreshToken: string, ipAddress?: string, userAgent?: string) {
    // 1. Verify token signature
    const payload = JwtUtil.verifyRefreshToken(oldRefreshToken);

    // 2. Check token in DB to ensure it's not revoked
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: oldRefreshToken },
    });

    if (!storedToken || storedToken.revokedAt || storedToken.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    // 3. Check Session
    const session = await prisma.session.findUnique({
      where: { token: oldRefreshToken },
    });

    if (!session || session.status !== SessionStatus.ACTIVE || session.expiresAt < new Date()) {
      throw new Error('Session invalid or expired');
    }

    // 4. Revoke old token and session using optimistic concurrency
    const [tokenUpdate] = await prisma.$transaction([
      prisma.refreshToken.updateMany({
        where: { token: oldRefreshToken, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.session.update({
        where: { token: oldRefreshToken },
        data: { status: SessionStatus.REVOKED },
      }),
    ]);

    if (tokenUpdate.count === 0) {
      throw new Error('Refresh token has already been revoked concurrently');
    }

    // 5. Fetch latest user details and generate new tokens
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });
    if (!user) {
      throw new Error('User not found');
    }

    const newPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      systemRole: user.systemRole,
    };

    const accessToken = JwtUtil.generateAccessToken(newPayload);
    const newRefreshToken = JwtUtil.generateRefreshToken(newPayload);

    // 6. Store new tokens and session
    await prisma.$transaction([
      prisma.refreshToken.create({
        data: {
          userId: payload.userId,
          token: newRefreshToken,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
      prisma.session.create({
        data: {
          userId: payload.userId,
          token: newRefreshToken,
          ipAddress,
          userAgent,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }

  /**
   * Logs out a specific session using its refresh token.
   */
  static async logout(refreshToken: string) {
    try {
      await prisma.$transaction([
        prisma.refreshToken.update({
          where: { token: refreshToken },
          data: { revokedAt: new Date() },
        }),
        prisma.session.update({
          where: { token: refreshToken },
          data: { status: SessionStatus.REVOKED },
        }),
      ]);
    } catch (error) {
      // If token doesn't exist, fail silently
    }
  }

  /**
   * Logs out all sessions for a user.
   */
  static async logoutAll(userId: string) {
    await prisma.$transaction([
      prisma.refreshToken.updateMany({
        where: { userId, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.session.updateMany({
        where: { userId, status: SessionStatus.ACTIVE },
        data: { status: SessionStatus.REVOKED },
      }),
    ]);
  }

  /**
   * Verifies a user's email address using a token.
   */
  static async verifyEmail(token: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      throw new Error('Invalid or expired verification token');
    }

    if (verificationToken.expiresAt < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      throw new Error('Verification token has expired');
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: new Date() },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
    ]);

    return user;
  }

  /**
   * Resends a verification email to a user.
   */
  static async resendVerification(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Fail silently to prevent user enumeration
      return;
    }

    if (user.emailVerified) {
      throw new Error('Email is already verified');
    }

    // Invalidate old tokens
    await prisma.verificationToken.deleteMany({
      where: { email },
    });

    // Create new token
    const token = crypto.randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        email: user.email,
        token,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Send Email
    await EmailService.sendVerificationEmail(user.email, token);
  }

  /**
   * Initiates the password reset flow.
   */
  static async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Fail silently to prevent user enumeration
      return;
    }

    // Invalidate any existing reset/verification tokens for this email
    await prisma.verificationToken.deleteMany({
      where: { email },
    });

    const token = crypto.randomBytes(32).toString('hex');
    await prisma.verificationToken.create({
      data: {
        email: user.email,
        token,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour for reset tokens
      },
    });

    await EmailService.sendPasswordResetEmail(user.email, token);
  }

  /**
   * Resets a user's password using a valid token.
   */
  static async resetPassword(token: string, newPassword: string) {
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      throw new Error('Invalid or expired reset token');
    }

    if (verificationToken.expiresAt < new Date()) {
      await prisma.verificationToken.delete({ where: { token } });
      throw new Error('Reset token has expired');
    }

    const user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const hashedPassword = await HashUtil.hash(newPassword);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.delete({
        where: { token },
      }),
      // Revoke all existing sessions and refresh tokens for security
      prisma.refreshToken.updateMany({
        where: { userId: user.id, revokedAt: null },
        data: { revokedAt: new Date() },
      }),
      prisma.session.updateMany({
        where: { userId: user.id, status: SessionStatus.ACTIVE },
        data: { status: SessionStatus.REVOKED },
      }),
    ]);

    return user;
  }
}
