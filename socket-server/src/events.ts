import { Socket, Server as SocketIOServer } from 'socket.io';
import { eLog } from './utils/util';
export function registerSocketEvents(socket: Socket, io: SocketIOServer) {
	socket.on('join', (room: string) => {
		socket.join(room);
		socket.to(room).emit('user-joined', { id: socket.id, room });
	});

	socket.on('leave', (room: string) => {
		socket.leave(room);
		socket.to(room).emit('user-left', { id: socket.id, room });
	});

	socket.on('message', (payload: { room: string; message: string }) => {
		const { room, message } = payload;
		io.to(room).emit('message', { from: socket.id, message, room, timestamp: Date.now() });
	});

	socket.on('typing', (payload: { room: string; typing: boolean }) => {
		const { room, typing } = payload;
		socket.to(room).emit('typing', { id: socket.id, typing });
	});

	socket.on('disconnect', (reason) => {
		eLog(`Socket ${socket.id} disconnected: ${reason}`);
	});
}

