import { io, Socket } from 'socket.io-client';

export let socket: Socket | null = null;

export const connectSocket = (token?: string) => {
  if (socket) return socket;
  
  socket = io(import.meta.env.VITE_SOCKET_URL || window.location.origin, {
    auth: { token },
    reconnection: true,
  });

  return socket;
};
