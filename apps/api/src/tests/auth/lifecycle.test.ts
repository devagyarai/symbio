import request from 'supertest';
import express from 'express';
import authRoutes from '../../auth/auth.routes';
import { errorHandler } from '../../middleware/error';
import { PrismaClient } from '@prisma/client';
import { EmailService } from '../../services/email.service';

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);
app.use(errorHandler);

const prisma = new PrismaClient();

// Mock EmailService to prevent actual emails from being sent
jest.mock('../../services/email.service', () => ({
  EmailService: {
    sendVerificationEmail: jest.fn().mockResolvedValue(undefined),
    sendPasswordResetEmail: jest.fn().mockResolvedValue(undefined),
  },
}));

describe('Auth Lifecycle: Email Verification & Password Reset', () => {
  let testUserEmail = 'lifecycle@test.com';
  let verificationToken = '';
  let resetToken = '';

  beforeAll(async () => {
    // Clean up
    await prisma.user.deleteMany({ where: { email: testUserEmail } });
    await prisma.verificationToken.deleteMany({ where: { email: testUserEmail } });
  });

  afterAll(async () => {
    await prisma.user.deleteMany({ where: { email: testUserEmail } });
    await prisma.verificationToken.deleteMany({ where: { email: testUserEmail } });
    await prisma.$disconnect();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('1. Registration & Email Verification', () => {
    it('should register and create a verification token, and call EmailService', async () => {
      const res = await request(app)
        .post('/auth/register')
        .send({
          email: testUserEmail,
          name: 'Lifecycle User',
          password: 'Password123!',
        });

      expect(res.status).toBe(201);
      expect(EmailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(EmailService.sendVerificationEmail).toHaveBeenCalledWith(testUserEmail, expect.any(String));

      // Extract token from DB to test verification endpoint
      const dbToken = await prisma.verificationToken.findFirst({
        where: { email: testUserEmail },
      });
      expect(dbToken).toBeDefined();
      verificationToken = dbToken!.token;
    });

    it('should verify email with valid token', async () => {
      const res = await request(app).get(`/auth/verify-email?token=${verificationToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Email verified successfully');

      // Ensure user is marked verified
      const user = await prisma.user.findUnique({ where: { email: testUserEmail } });
      expect(user?.emailVerified).not.toBeNull();

      // Ensure token is deleted
      const dbToken = await prisma.verificationToken.findUnique({ where: { token: verificationToken } });
      expect(dbToken).toBeNull();
    });

    it('should reject invalid verification token', async () => {
      const res = await request(app).get('/auth/verify-email?token=invalid_token');
      expect(res.status).not.toBe(200);
    });
  });

  describe('2. Resend Verification', () => {
    it('should prevent resending for already verified email', async () => {
      const res = await request(app)
        .post('/auth/resend-verification')
        .send({ email: testUserEmail });

      expect(res.status).toBe(200);
    });

    it('should resend verification for unverified user', async () => {
      const unverifiedEmail = 'unverified@test.com';
      await prisma.user.create({
        data: { email: unverifiedEmail, name: 'Unverified', password: 'hash' }
      });

      const res = await request(app)
        .post('/auth/resend-verification')
        .send({ email: unverifiedEmail });
      
      expect(res.status).toBe(200);
      expect(EmailService.sendVerificationEmail).toHaveBeenCalledTimes(1);

      await prisma.user.delete({ where: { email: unverifiedEmail } });
      await prisma.verificationToken.deleteMany({ where: { email: unverifiedEmail } });
    });
  });

  describe('3. Password Reset', () => {
    it('should initiate forgot password and send reset email', async () => {
      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ email: testUserEmail });

      expect(res.status).toBe(200);
      expect(EmailService.sendPasswordResetEmail).toHaveBeenCalledTimes(1);
      expect(EmailService.sendPasswordResetEmail).toHaveBeenCalledWith(testUserEmail, expect.any(String));

      // Extract reset token for next test
      const dbToken = await prisma.verificationToken.findFirst({
        where: { email: testUserEmail },
      });
      expect(dbToken).toBeDefined();
      resetToken = dbToken!.token;
    });

    it('should return 200 for forgot password on non-existent email (enumeration prevention)', async () => {
      const res = await request(app)
        .post('/auth/forgot-password')
        .send({ email: 'nobody@test.com' });

      expect(res.status).toBe(200);
      expect(EmailService.sendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should reset password with valid token and revoke sessions', async () => {
      // First, create a mock session to verify it gets revoked
      const user = await prisma.user.findUnique({ where: { email: testUserEmail } });
      await prisma.session.create({
        data: {
          userId: user!.id,
          token: 'mock-session-token',
          expiresAt: new Date(Date.now() + 100000),
          status: 'ACTIVE'
        }
      });

      const res = await request(app)
        .post('/auth/reset-password')
        .send({
          token: resetToken,
          password: 'NewPassword123!',
        });

      expect(res.status).toBe(200);
      
      // Ensure token is deleted
      const dbToken = await prisma.verificationToken.findUnique({ where: { token: resetToken } });
      expect(dbToken).toBeNull();

      // Ensure sessions are revoked
      const session = await prisma.session.findUnique({ where: { token: 'mock-session-token' } });
      expect(session?.status).toBe('REVOKED');
    });

    it('should reject invalid reset token', async () => {
      const res = await request(app)
        .post('/auth/reset-password')
        .send({
          token: 'bad_token',
          password: 'NewPassword123!',
        });

      expect(res.status).not.toBe(200);
    });
  });
});
