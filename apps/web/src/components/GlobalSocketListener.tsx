'use client';

import { useEffect } from 'react';
import { useSocket } from '../hooks/useSocket';
import { toast } from 'sonner';

export function GlobalSocketListener() {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    const handleNotification = (data: any) => {
      console.log('Realtime notification received:', data);
      toast.info(data.message || 'New notification', {
        id: data.id,
      });
    };

    socket.on('notification', handleNotification);

    return () => {
      socket.off('notification', handleNotification);
    };
  }, [socket]);

  return null;
}
