import { Socket } from 'socket.io';
import { get_env } from './utils/util';

export function socketAuth(socket: Socket, next: (err?: Error) => void) {
	const auth = socket.handshake.auth || {};
	const query = socket.handshake.query || {};
	const tokenFromClient = (auth.token as string) || (query.token as string);

	const expected = get_env('AUTH_TOKEN');
	if (expected && tokenFromClient !== expected) {
		return next(new Error('Unauthorized'));
	}

	socket.data = { token: tokenFromClient } as any;
	return next();
}

