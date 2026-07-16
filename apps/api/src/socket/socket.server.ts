import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import { socketAuthMiddleware } from './socket.auth';
import { SocketEvents } from './socket.events';
import { PresenceService } from './presence.service';
import { NotificationService } from './notification.service';
import { logger } from 'logger';

/**
 * Workspace room name convention: workspace:{workspaceId}
 * Organization room name convention: organization:{organizationId}
 * User personal room convention: user:{userId}
 */

let io: Server;

/**
 * Initialize the Socket.IO server on the given HTTP server.
 * Call this exactly once after `http.createServer(app)`.
 */
export function initSocketServer(httpServer: HttpServer): Server {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.CORS_ORIGIN || '*',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Ping/pong configuration
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Inject io into the NotificationService so modules can emit without
  // holding a direct reference to io.
  NotificationService.init(io);

  // ── Authentication ───────────────────────────────────────────────────────────
  io.use(socketAuthMiddleware);

  // ── Connection handler ───────────────────────────────────────────────────────
  io.on('connection', (socket: Socket) => {
    const { userId } = socket.data.user as { userId: string };

    logger.info({ userId, socketId: socket.id }, 'Socket connected');

    // Join personal room so the server can send targeted notifications.
    socket.join(`user:${userId}`);

    // ── join_workspace ────────────────────────────────────────────────────────
    socket.on(SocketEvents.JOIN_WORKSPACE, ({ workspaceId }: { workspaceId: string }) => {
      if (!workspaceId) return;

      socket.join(`workspace:${workspaceId}`);
      PresenceService.setOnline(userId, socket.id, workspaceId);

      // Broadcast to other members of the workspace
      socket.to(`workspace:${workspaceId}`).emit(SocketEvents.USER_JOINED, {
        userId,
        workspaceId,
      });

      logger.debug({ userId, workspaceId }, 'User joined workspace room');
    });

    // ── leave_workspace ───────────────────────────────────────────────────────
    socket.on(SocketEvents.LEAVE_WORKSPACE, ({ workspaceId }: { workspaceId: string }) => {
      if (!workspaceId) return;

      socket.leave(`workspace:${workspaceId}`);
      PresenceService.setActiveWorkspace(userId, null);

      socket.to(`workspace:${workspaceId}`).emit(SocketEvents.USER_LEFT, {
        userId,
        workspaceId,
      });

      logger.debug({ userId, workspaceId }, 'User left workspace room');
    });

    // ── disconnect ────────────────────────────────────────────────────────────
    socket.on('disconnect', (reason: string) => {
      // Get the user's latest entry to know which workspace they were in
      const entry = PresenceService.getEntry(userId);
      const activeWorkspaceId = entry?.workspaceId;

      // Remove this specific socket
      PresenceService.setOffline(socket.id);

      // If they were in a workspace, check if they still have ANY active tabs left in that workspace
      if (activeWorkspaceId) {
        const stillInWorkspace = PresenceService.getOnlineUsers(activeWorkspaceId).some(e => e.userId === userId);
        if (!stillInWorkspace) {
          // Only notify if they completely left the workspace
          io.to(`workspace:${activeWorkspaceId}`).emit(SocketEvents.USER_LEFT, {
            userId,
            workspaceId: activeWorkspaceId,
          });
        }
      }

      logger.info({ userId, socketId: socket.id, reason }, 'Socket disconnected');
    });
  });

  logger.info('Socket.IO server initialized');
  return io;
}

/**
 * Returns the initialized Socket.IO server instance.
 * Throws if called before initSocketServer().
 */
export function getSocketServer(): Server {
  if (!io) throw new Error('Socket.IO server not initialized');
  return io;
}
