import { Server } from 'socket.io';
import { SocketEvents } from './socket.events';
import { logger } from 'logger';

export interface NotificationPayload {
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  metadata?: Record<string, unknown>;
}

/**
 * Centralized notification / emission facade.
 *
 * All modules MUST use this service to emit socket events.
 * No module should hold a reference to `io` and call io.emit() directly.
 *
 * The io instance is injected once at startup via `NotificationService.init(io)`.
 */
class NotificationServiceClass {
  private io: Server | null = null;

  /**
   * Called once when the Socket.IO server is initialized.
   */
  init(io: Server): void {
    this.io = io;
    logger.info('NotificationService initialized');
  }

  // ─── Internal helper ────────────────────────────────────────────────────────

  private get server(): Server {
    if (!this.io) {
      throw new Error('NotificationService not initialized. Call init(io) first.');
    }
    return this.io;
  }

  private workspaceRoom(workspaceId: string): string {
    return `workspace:${workspaceId}`;
  }

  private organizationRoom(organizationId: string): string {
    return `organization:${organizationId}`;
  }

  private userRoom(userId: string): string {
    return `user:${userId}`;
  }

  // ─── Public emission methods ─────────────────────────────────────────────────

  /**
   * Broadcast a workspace update to all members of that workspace.
   */
  emitWorkspaceUpdated(workspaceId: string, data: Record<string, unknown>): void {
    this.server
      .to(this.workspaceRoom(workspaceId))
      .emit(SocketEvents.WORKSPACE_UPDATED, { workspaceId, data });
    logger.debug({ workspaceId }, 'Emitted workspace_updated');
  }

  /**
   * Broadcast an organization update to all members of that organization.
   */
  emitOrganizationUpdated(organizationId: string, data: Record<string, unknown>): void {
    this.server
      .to(this.organizationRoom(organizationId))
      .emit(SocketEvents.ORGANIZATION_UPDATED, { organizationId, data });
    logger.debug({ organizationId }, 'Emitted organization_updated');
  }

  /**
   * Notify workspace members that a file was uploaded.
   */
  emitFileUploaded(workspaceId: string, fileAsset: Record<string, unknown>): void {
    this.server
      .to(this.workspaceRoom(workspaceId))
      .emit(SocketEvents.FILE_UPLOADED, { workspaceId, fileAsset });
    logger.debug({ workspaceId }, 'Emitted file_uploaded');
  }

  /**
   * Notify workspace members that a file was deleted.
   */
  emitFileDeleted(workspaceId: string, fileAssetId: string): void {
    this.server
      .to(this.workspaceRoom(workspaceId))
      .emit(SocketEvents.FILE_DELETED, { workspaceId, fileAssetId });
    logger.debug({ workspaceId, fileAssetId }, 'Emitted file_deleted');
  }

  /**
   * Broadcast an audit log entry to the relevant room(s).
   */
  emitActivityLogged(
    auditLog: Record<string, unknown>,
    workspaceId?: string,
    organizationId?: string,
  ): void {
    if (workspaceId) {
      this.server
        .to(this.workspaceRoom(workspaceId))
        .emit(SocketEvents.ACTIVITY_LOGGED, { auditLog });
    }
    if (organizationId) {
      this.server
        .to(this.organizationRoom(organizationId))
        .emit(SocketEvents.ACTIVITY_LOGGED, { auditLog });
    }
    logger.debug({ workspaceId, organizationId }, 'Emitted activity_logged');
  }

  /**
   * Send a personal notification to a specific user.
   */
  emitToUser(userId: string, payload: NotificationPayload): void {
    this.server
      .to(this.userRoom(userId))
      .emit(SocketEvents.NOTIFICATION, payload);
    logger.debug({ userId }, 'Emitted notification to user');
  }
}

export const NotificationService = new NotificationServiceClass();
