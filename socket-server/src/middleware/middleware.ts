import type { Algorithm } from 'jsonwebtoken';
import type { Socket } from 'socket.io';
import checkJwt from '../helper/check_jwt';
import sessionStore from '../controller/controller.session.store';
import type { SocketData } from '../types/socket';

type JwtAuthPayload = {
	user_id: string;
	session_id: string;
};

function extractBearer(value: unknown): string | null {
	if (Array.isArray(value)) value = value[0];
	if (typeof value !== 'string') return null;
	const trimmed = value.trim();
	if (!trimmed) return null;
	if (/^bearer\s+/i.test(trimmed)) return trimmed.replace(/^bearer\s+/i, '').trim();
	return trimmed;
}

function readHandshakeToken(socket: Socket): string | null {
	const fromAuth = extractBearer((socket.handshake.auth as any)?.token);
	if (fromAuth) return fromAuth;
	const fromHeader = extractBearer(socket.handshake.headers?.authorization);
	if (fromHeader) return fromHeader;
	const fromQuery = extractBearer((socket.handshake.query as any)?.token);
	if (fromQuery) return fromQuery;

	return null;
}

function isJwtAuthPayload(payload: unknown): payload is JwtAuthPayload {
	if (!payload || typeof payload !== 'object') return false;
	const maybe = payload as Record<string, unknown>;
	return typeof maybe.user_id === 'string' && typeof maybe.session_id === 'string';
}

export function createSocketAuthMiddleware(options: { jwtAlgorithms?: Algorithm[];}) {
	const { jwtAlgorithms } = options;
	return (socket: Socket<any, any, any, SocketData>, next: (err?: Error) => void) => {
		void (async () => {
			const token = readHandshakeToken(socket);
			if (!token) return next(new Error('UNAUTHORIZED'));

			const verified = checkJwt.verifyToken(token, jwtAlgorithms ? { algorithms: jwtAlgorithms } : undefined);
			if (!verified?.status) return next(new Error('TOKEN_INVALID'));

			const decoded: unknown = verified.decoded;
			if (!isJwtAuthPayload(decoded)) return next(new Error('TOKEN_INVALID'));

			const userId = decoded.user_id.trim();
			const sessionId = decoded.session_id.trim();
			if (!userId || !sessionId) return next(new Error('TOKEN_INVALID'));

			try {
				const sessionCheck = await sessionStore.assertOrAdopt(userId, sessionId);
				if (!sessionCheck.ok) return next(new Error(sessionCheck.reason));
			} catch {
				return next(new Error('AUTH_UNAVAILABLE'));
			}
			socket.data.user_id = userId;
			socket.data.session_id = sessionId;
			socket.user_id = userId;
			socket.session_id = sessionId;
			return next();
		})();
	};
}
