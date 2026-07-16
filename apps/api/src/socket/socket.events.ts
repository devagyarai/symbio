/**
 * Centralized Socket.IO event name constants.
 * All modules must use these constants — never raw strings.
 */
export const SocketEvents = {
  // Client → Server
  JOIN_WORKSPACE: 'join_workspace',
  LEAVE_WORKSPACE: 'leave_workspace',

  // Server → Room
  USER_JOINED: 'user_joined',
  USER_LEFT: 'user_left',
  WORKSPACE_UPDATED: 'workspace_updated',
  ORGANIZATION_UPDATED: 'organization_updated',
  FILE_UPLOADED: 'file_uploaded',
  FILE_DELETED: 'file_deleted',
  ACTIVITY_LOGGED: 'activity_logged',

  // Server → User (personal channel)
  NOTIFICATION: 'notification',
} as const;

export type SocketEventName = (typeof SocketEvents)[keyof typeof SocketEvents];
