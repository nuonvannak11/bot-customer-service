import type { Socket } from 'socket.io';
import type { IoServer } from './socket';
import { eLog } from './utils/util';

export function registerSocketEvents(socket: Socket, _io: IoServer) {
	socket.on('disconnect', (reason) => {
		eLog(`socket disconnected id=${socket.id} reason=${reason}`);
	});
}
