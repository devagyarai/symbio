import http from 'http';
import express from 'express';
import { io as ioClient, Socket as ClientSocket } from 'socket.io-client';
import { initSocketServer } from '../../socket/socket.server';
import { SocketEvents } from '../../socket/socket.events';
import { JwtUtil } from '../../utils/jwt.util';

// ── Helpers ──────────────────────────────────────────────────────────────────

function createTestServer() {
  const app = express();
  const httpServer = http.createServer(app);
  initSocketServer(httpServer);
  return httpServer;
}

function connectClient(port: number, token?: string): ClientSocket {
  return ioClient(`http://localhost:${port}`, {
    auth: token ? { token } : {},
    transports: ['websocket'],
    autoConnect: false,
  });
}

// Generate a real JWT so socket.auth middleware can verify it
const validToken = JwtUtil.generateAccessToken({ userId: 'test-user-1' });
const WORKSPACE_ID = 'ws-test-1234';

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('Socket.IO Server', () => {
  let httpServer: http.Server;
  let port: number;

  beforeAll((done) => {
    httpServer = createTestServer();
    httpServer.listen(0, () => {
      const addr = httpServer.address();
      port = typeof addr === 'object' && addr ? addr.port : 0;
      done();
    });
  });

  afterAll((done) => {
    httpServer.close(done);
  });

  // ── Authentication ──────────────────────────────────────────────────────────

  describe('Authentication', () => {
    it('should reject connection without a token', (done) => {
      const client = connectClient(port);
      client.on('connect_error', (err) => {
        expect(err.message).toContain('Authentication error');
        client.disconnect();
        done();
      });
      client.connect();
    });

    it('should reject connection with an invalid token', (done) => {
      const client = connectClient(port, 'not.a.real.token');
      client.on('connect_error', (err) => {
        expect(err.message).toContain('Authentication error');
        client.disconnect();
        done();
      });
      client.connect();
    });

    it('should accept connection with a valid JWT', (done) => {
      const client = connectClient(port, validToken);
      client.on('connect', () => {
        expect(client.connected).toBe(true);
        client.disconnect();
        done();
      });
      client.on('connect_error', (err) => {
        done(err);
      });
      client.connect();
    });
  });

  // ── Workspace Rooms ─────────────────────────────────────────────────────────

  describe('Workspace Rooms', () => {
    it('should emit user_joined to room when joining a workspace', (done) => {
      const token1 = JwtUtil.generateAccessToken({ userId: 'user-room-1' });
      const token2 = JwtUtil.generateAccessToken({ userId: 'user-room-2' });

      const client1 = connectClient(port, token1);
      const client2 = connectClient(port, token2);

      // Client 2 listens for user_joined BEFORE client 1 joins
      client2.on('connect', () => {
        client2.emit(SocketEvents.JOIN_WORKSPACE, { workspaceId: WORKSPACE_ID });

        client2.on(SocketEvents.USER_JOINED, (data: { userId: string; workspaceId: string }) => {
          expect(data.userId).toBe('user-room-1');
          expect(data.workspaceId).toBe(WORKSPACE_ID);
          client1.disconnect();
          client2.disconnect();
          done();
        });

        // After client2 is in the room, client1 joins
        setTimeout(() => {
          client1.on('connect', () => {
            client1.emit(SocketEvents.JOIN_WORKSPACE, { workspaceId: WORKSPACE_ID });
          });
          client1.connect();
        }, 100);
      });

      client2.connect();
    }, 8000);

    it('should emit user_left to room when leaving a workspace', (done) => {
      const token1 = JwtUtil.generateAccessToken({ userId: 'user-leave-1' });
      const token2 = JwtUtil.generateAccessToken({ userId: 'user-leave-2' });

      const client1 = connectClient(port, token1);
      const client2 = connectClient(port, token2);

      client2.on('connect', () => {
        client2.emit(SocketEvents.JOIN_WORKSPACE, { workspaceId: WORKSPACE_ID });

        client2.on(SocketEvents.USER_LEFT, (data: { userId: string; workspaceId: string }) => {
          expect(data.userId).toBe('user-leave-1');
          client1.disconnect();
          client2.disconnect();
          done();
        });

        setTimeout(() => {
          client1.on('connect', () => {
            client1.emit(SocketEvents.JOIN_WORKSPACE, { workspaceId: WORKSPACE_ID });
            // Leave right after joining
            setTimeout(() => {
              client1.emit(SocketEvents.LEAVE_WORKSPACE, { workspaceId: WORKSPACE_ID });
            }, 100);
          });
          client1.connect();
        }, 100);
      });

      client2.connect();
    }, 8000);
  });

  // ── NotificationService ──────────────────────────────────────────────────────

  describe('NotificationService', () => {
    it('should deliver workspace_updated event to members in the room', (done) => {
      const token = JwtUtil.generateAccessToken({ userId: 'notif-user-1' });
      const client = connectClient(port, token);

      client.on('connect', () => {
        client.emit(SocketEvents.JOIN_WORKSPACE, { workspaceId: 'notif-ws-1' });

        client.on(SocketEvents.WORKSPACE_UPDATED, (data: { workspaceId: string }) => {
          expect(data.workspaceId).toBe('notif-ws-1');
          client.disconnect();
          done();
        });

        // Wait for the join to propagate, then emit from server side
        setTimeout(async () => {
          const { NotificationService } = await import('../../socket/notification.service');
          NotificationService.emitWorkspaceUpdated('notif-ws-1', { name: 'Updated Name' });
        }, 150);
      });

      client.connect();
    }, 8000);

    it('should deliver notification event to a specific user', (done) => {
      const userId = 'notif-target-user';
      const token = JwtUtil.generateAccessToken({ userId });
      const client = connectClient(port, token);

      client.on('connect', () => {
        client.on(SocketEvents.NOTIFICATION, (data: { message: string; type: string }) => {
          expect(data.message).toBe('Hello, user!');
          expect(data.type).toBe('info');
          client.disconnect();
          done();
        });

        setTimeout(async () => {
          const { NotificationService } = await import('../../socket/notification.service');
          NotificationService.emitToUser(userId, { message: 'Hello, user!', type: 'info' });
        }, 150);
      });

      client.connect();
    }, 8000);
  });
});
