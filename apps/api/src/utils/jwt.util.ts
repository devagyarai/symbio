import jwt from 'jsonwebtoken';

const IS_PROD = process.env.NODE_ENV === 'production';

export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (IS_PROD) throw new Error('JWT_SECRET is missing in production environment');
    console.warn('WARNING: Using default JWT_SECRET in non-production environment');
    return 'super-secret-symbio-key-dev-only';
  }
  return secret;
};

export const getJwtRefreshSecret = () => {
  const secret = process.env.JWT_REFRESH_SECRET;
  if (!secret) {
    if (IS_PROD) throw new Error('JWT_REFRESH_SECRET is missing in production environment');
    console.warn('WARNING: Using default JWT_REFRESH_SECRET in non-production environment');
    return 'super-secret-symbio-refresh-key-dev-only';
  }
  return secret;
};
const ACCESS_TOKEN_EXPIRES_IN = '15m';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

export interface JwtPayload {
  userId: string;
  email: string;
  name: string;
  systemRole: string;
}

export const JwtUtil = {
  /**
   * Generates a short-lived access token
   */
  generateAccessToken(payload: JwtPayload): string {
    return jwt.sign(payload, getJwtSecret(), {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
  },

  /**
   * Generates a cryptographically random refresh token
   * We do not strictly need to sign this if we store it in the DB,
   * but signing it allows stateless expiry checking.
   */
  generateRefreshToken(payload: JwtPayload): string {
    return jwt.sign(payload, getJwtRefreshSecret(), {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
  },

  /**
   * Verifies and decodes a JWT token
   */
  verifyAccessToken(token: string): JwtPayload {
    return jwt.verify(token, getJwtSecret()) as JwtPayload;
  },

  verifyRefreshToken(token: string): JwtPayload {
    return jwt.verify(token, getJwtRefreshSecret()) as JwtPayload;
  },
};
