import { logger } from 'logger';

/**
 * Presence entry for a connected user.
 */
export interface PresenceEntry {
  socketId: string;
  userId: string;
  workspaceId: string | null;
  connectedAt: Date;
  lastSeen: Date;
}

/**
 * In-memory presence service.
 *
 * Maps socketId → PresenceEntry.
 * This allows a single user (userId) to connect from multiple tabs without
 * overwriting their presence state, preventing "false offline" states.
 *
 * NOTE: For multi-instance deployments, replace this with a Redis-backed
 * implementation that shares state across nodes via pub/sub.
 */
class PresenceServiceClass {
  private readonly store = new Map<string, PresenceEntry>();

  /**
   * Mark a user as online for a specific socket connection.
   */
  setOnline(userId: string, socketId: string, workspaceId: string | null = null): void {
    this.store.set(socketId, {
      socketId,
      userId,
      workspaceId,
      connectedAt: new Date(),
      lastSeen: new Date(),
    });
    logger.debug({ userId, socketId, workspaceId }, 'Socket came online');
  }

  /**
   * Update the active workspace for a user across all their sockets.
   * (Alternatively, could update just the specific socket, but typically
   * a user operates in one workspace at a time per device. Here we update all).
   */
  setActiveWorkspace(userId: string, workspaceId: string | null): void {
    for (const [socketId, entry] of this.store.entries()) {
      if (entry.userId === userId) {
        entry.workspaceId = workspaceId;
        entry.lastSeen = new Date();
        this.store.set(socketId, entry);
      }
    }
  }

  /**
   * Mark a specific socket as offline.
   * To track user's last seen time, we only really log it. If they have no more
   * sockets, they are fully offline.
   */
  setOffline(socketId: string): void {
    const entry = this.store.get(socketId);
    if (entry) {
      this.store.delete(socketId);
      logger.debug({ userId: entry.userId, socketId }, 'Socket went offline');
    }
  }

  /**
   * Check whether a user is currently online (has any active sockets).
   */
  isOnline(userId: string): boolean {
    for (const entry of this.store.values()) {
      if (entry.userId === userId) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get the presence entry for a user.
   * If they have multiple, returns the most recently seen one.
   */
  getEntry(userId: string): PresenceEntry | null {
    let latest: PresenceEntry | null = null;
    for (const entry of this.store.values()) {
      if (entry.userId === userId) {
        if (!latest || entry.lastSeen > latest.lastSeen) {
          latest = entry;
        }
      }
    }
    return latest;
  }

  /**
   * Get all users currently active in a given workspace.
   * Deduplicates by userId so each user is counted once.
   */
  getOnlineUsers(workspaceId: string): PresenceEntry[] {
    const userMap = new Map<string, PresenceEntry>();
    for (const entry of this.store.values()) {
      if (entry.workspaceId === workspaceId) {
        // Keep the latest entry for the user
        const existing = userMap.get(entry.userId);
        if (!existing || entry.lastSeen > existing.lastSeen) {
          userMap.set(entry.userId, entry);
        }
      }
    }
    return Array.from(userMap.values());
  }

  /**
   * Get the entire online users list, deduplicated by userId.
   */
  getAllOnline(): PresenceEntry[] {
    const userMap = new Map<string, PresenceEntry>();
    for (const entry of this.store.values()) {
      const existing = userMap.get(entry.userId);
      if (!existing || entry.lastSeen > existing.lastSeen) {
        userMap.set(entry.userId, entry);
      }
    }
    return Array.from(userMap.values());
  }
}

export const PresenceService = new PresenceServiceClass();
