import { Socket } from 'socket.io';

export function socketAuth(socket: Socket, next: (err?: Error) => void) {
	const auth = socket.handshake.auth || {};
	const query = socket.handshake.query || {};
	const tokenFromClient = (auth.token as string) || (query.token as string);

	const expected = process.env.AUTH_TOKEN;
	if (expected && tokenFromClient !== expected) {
		return next(new Error('Unauthorized'));
	}

	// Attach claims or user info to the socket if needed
	socket.data = { token: tokenFromClient } as any;
	return next();
}

