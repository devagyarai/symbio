import { Socket } from 'socket.io';
import { JwtUtil } from '../utils/jwt.util';
import { logger } from 'logger';

/**
 * Socket.IO JWT Authentication Middleware.
 *
 * Clients must pass a valid JWT as:
 *   - socket.auth.token  (recommended, set via `io({ auth: { token } })`)
 *   - or Authorization header  (Bearer <token>)
 *
 * On success, the decoded payload is attached to socket.data.user.
 * On failure, the connection is rejected with an error.
 */
export const socketAuthMiddleware = (socket: Socket, next: (err?: Error) => void) => {
  try {
    // 1. Try socket auth object first (most common for WS clients)
    let token: string | undefined = socket.handshake.auth?.token;

    // 2. Fallback to Authorization header
    if (!token) {
      const authHeader = socket.handshake.headers?.authorization;
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
      }
    }

    // 3. Fallback to query param (useful for browser websocket testing)
    if (!token) {
      token = socket.handshake.query?.token as string | undefined;
    }

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    const payload = JwtUtil.verifyAccessToken(token);
    socket.data.user = payload;

    logger.debug({ userId: payload.userId, socketId: socket.id }, 'Socket authenticated');
    next();
  } catch (err) {
    logger.warn({ socketId: socket.id }, 'Socket authentication failed');
    next(new Error('Authentication error: Invalid or expired token'));
  }
};
