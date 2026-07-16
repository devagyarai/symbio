import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

// Fallback sender if not configured differently
const SENDER_EMAIL = 'Symbio <noreply@symbio.ready.nest>';

// Base URL for links (usually from env, fallback to localhost)
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

export class EmailService {
  /**
   * Sends an email verification link to the user.
   */
  static async sendVerificationEmail(email: string, token: string) {
    const verificationLink = `${APP_URL}/auth/verify-email?token=${token}`;

    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000000; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px;">Symbio</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">Verify your email address</h2>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
            Welcome to Symbio! Please click the button below to verify your email address and activate your account.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${verificationLink}" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #71717a; font-size: 14px; margin-bottom: 0;">
            If you didn't create an account with Symbio, you can safely ignore this email.
          </p>
        </div>
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #eaeaea;">
          <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Symbio. All rights reserved.
          </p>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: email,
        subject: 'Verify your Symbio account',
        html,
      });
    } catch (error) {
      console.error('Failed to send verification email:', error);
      // We don't throw here to avoid failing the main transaction (e.g. registration)
    }
  }

  /**
   * Sends a password reset link to the user.
   */
  static async sendPasswordResetEmail(email: string, token: string) {
    // Usually password reset goes to a frontend form which then calls POST /auth/reset-password
    // For this implementation, we assume the frontend route is /reset-password
    const resetLink = `${APP_URL}/reset-password?token=${token}`;

    const html = `
      <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #eaeaea; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #000000; padding: 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px;">Symbio</h1>
        </div>
        <div style="padding: 32px 24px;">
          <h2 style="color: #1a1a1a; margin-top: 0; font-size: 20px;">Reset your password</h2>
          <p style="color: #4a4a4a; font-size: 16px; line-height: 1.5;">
            We received a request to reset your password for your Symbio account. Click the button below to choose a new password.
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background-color: #000000; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 500; font-size: 16px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #71717a; font-size: 14px; line-height: 1.5; margin-bottom: 0;">
            If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
            This link will expire in 1 hour.
          </p>
        </div>
        <div style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #eaeaea;">
          <p style="color: #a1a1aa; font-size: 12px; margin: 0;">
            &copy; ${new Date().getFullYear()} Symbio. All rights reserved.
          </p>
        </div>
      </div>
    `;

    try {
      await resend.emails.send({
        from: SENDER_EMAIL,
        to: email,
        subject: 'Reset your Symbio password',
        html,
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
  }
}
