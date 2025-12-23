import type { Algorithm } from 'jsonwebtoken';
import type { Socket } from 'socket.io';
import checkJwt from './helper/check_jwt';
import { SessionStore } from './sessionStore';
import type { SocketData } from './types/socket';

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

export function createSocketAuthMiddleware(options: {
	jwtAlgorithms?: Algorithm[];
	sessionStore: SessionStore;
}) {
	const { jwtAlgorithms, sessionStore } = options;

	return (socket: Socket<any, any, any, SocketData>, next: (err?: Error) => void) => {
		void (async () => {
			const token = readHandshakeToken(socket);
			if (!token) return next(new Error('TOKEN_MISSING'));

			const verified = checkJwt.verifyToken(token, jwtAlgorithms ? { algorithms: jwtAlgorithms } : undefined);
			if (!verified?.status) return next(new Error('TOKEN_INVALID'));

			const decoded: unknown = verified.decoded;
			if (!isJwtAuthPayload(decoded)) return next(new Error('TOKEN_INVALID'));

			const userId = decoded.user_id.trim();
			const sessionId = decoded.session_id.trim();

			if (!OBJECT_ID_REGEX.test(userId)) return next(new Error('TOKEN_INVALID'));
			if (!UUID_REGEX.test(sessionId)) return next(new Error('TOKEN_INVALID'));

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
