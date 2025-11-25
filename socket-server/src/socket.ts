import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { registerSocketEvents } from './events';
import { socketAuth } from './middleware';

export function initSocket(server: HttpServer) {
  const io = new SocketIOServer(server, {
    cors: { origin: '*' },
  });

  io.use((socket: Socket, next) => socketAuth(socket, next));

  io.on('connection', (socket: Socket) => {
    registerSocketEvents(socket, io);
  });

  return io;
}

export type IoServer = ReturnType<typeof initSocket>;
