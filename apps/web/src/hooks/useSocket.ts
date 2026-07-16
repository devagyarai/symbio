import { useEffect, useState } from 'react';
import { Socket } from 'socket.io-client';
import { initSocket, getSocket } from '../socket/socket.client';
import { useAuthStore } from '../store/useAuthStore';

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      const socketInstance = initSocket();
      setSocket(socketInstance);

      if (socketInstance) {
        setIsConnected(socketInstance.connected);

        const onConnect = () => setIsConnected(true);
        const onDisconnect = () => setIsConnected(false);

        socketInstance.on('connect', onConnect);
        socketInstance.on('disconnect', onDisconnect);

        return () => {
          socketInstance.off('connect', onConnect);
          socketInstance.off('disconnect', onDisconnect);
        };
      }
    }
  }, [isAuthenticated]);

  return { socket, isConnected };
}

export function useWorkspaceSocket(workspaceId: string | null) {
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    if (socket && isConnected && workspaceId) {
      socket.emit('join_workspace', { workspaceId });

      return () => {
        socket.emit('leave_workspace', { workspaceId });
      };
    }
  }, [socket, isConnected, workspaceId]);

  return { socket, isConnected };
}
