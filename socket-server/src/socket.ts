import { Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { registerSocketEvents } from './events';
import { createSocketAuthMiddleware } from './middleware';
import type { ClientToServerEvents, InterServerEvents, ServerToClientEvents, SocketData } from './types/socket';
import { SessionStore } from './sessionStore';
import { get_env, eLog } from './utils/util';
import type { Algorithm } from 'jsonwebtoken';

function getUserRoom(userId: string) {
	return `user:${userId}`;
}

function parseCorsOrigin(value: unknown): string | string[] {
	if (typeof value !== 'string') return '*';
	const trimmed = value.trim();
	if (!trimmed || trimmed === '*') return '*';
	const parts = trimmed
		.split(',')
		.map((p) => p.trim())
		.filter(Boolean);
	return parts.length <= 1 ? parts[0] : parts;
}

function parseJwtAlgorithms(value: unknown): Algorithm[] | undefined {
	if (typeof value !== 'string') return ['HS256'];
	const trimmed = value.trim();
	if (!trimmed) return ['HS256'];
	return trimmed
		.split(',')
		.map((p) => p.trim())
		.filter(Boolean) as Algorithm[];
}

export function initSocket(server: HttpServer, sessionStore: SessionStore) {
	const corsOrigin = parseCorsOrigin(get_env('CORS_ORIGIN', '*'));
	if (!get_env('JWT_SECRET')) {
		throw new Error('Missing JWT_SECRET (required for socket handshake authentication)');
	}
	const jwtAlgorithms = parseJwtAlgorithms(get_env('JWT_ALGORITHMS', 'HS256'));

	const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
		cors: { origin: corsOrigin },
	});

	io.use(
		createSocketAuthMiddleware({
			jwtAlgorithms,
			sessionStore,
		})
	);

	io.on('connection', (socket) => {
		socket.join(getUserRoom(socket.data.user_id));
		eLog(`socket connected user=${socket.data.user_id} session=${socket.data.session_id} id=${socket.id}`);
		registerSocketEvents(socket, io);
	});

	return io;
}

export type IoServer = ReturnType<typeof initSocket>;
