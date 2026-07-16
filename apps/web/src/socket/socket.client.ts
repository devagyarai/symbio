import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/useAuthStore';

// Singleton socket instance
let socket: Socket | null = null;

export const initSocket = () => {
  if (socket) return socket;

  const token = localStorage.getItem('access_token');
  
  if (!token) return null;

  socket = io(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001', {
    auth: {
      token,
    },
    autoConnect: true,
  });

  socket.on('connect', () => {
    console.log('Socket connected:', socket?.id);
  });

  socket.on('disconnect', () => {
    console.log('Socket disconnected');
  });

  socket.on('connect_error', (error) => {
    console.error('Socket connection error:', error);
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};
