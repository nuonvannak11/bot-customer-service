import crypto from 'crypto';
import { Router, type NextFunction, type Request, type Response } from 'express';
import type { IoServer } from '../socket';
import { SessionStore } from '../sessionStore';
import type { SupportedUserEvent } from '../types/socket';

const OBJECT_ID_REGEX = /^[a-f0-9]{24}$/i;
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const SUPPORTED_USER_EVENTS: ReadonlySet<SupportedUserEvent> = new Set([
	'profile:update',
	'account:update',
	'auth:logout',
]);

function userRoom(userId: string) {
	return `user:${userId}`;
}

function timingSafeEqual(a: string, b: string): boolean {
	const aBuf = Buffer.from(a);
	const bBuf = Buffer.from(b);
	if (aBuf.length !== bBuf.length) return false;
	return crypto.timingSafeEqual(aBuf, bBuf);
}

function extractBearerToken(headerValue: unknown): string | null {
	if (typeof headerValue !== 'string') return null;
	const match = headerValue.match(/^Bearer\s+(.+)$/i);
	return match?.[1]?.trim() || null;
}

function internalAuth(internalSecret: string) {
	return (req: Request, res: Response, next: NextFunction) => {
		if (req.headers['sec-fetch-mode'] || req.headers['sec-fetch-site'] || req.headers['sec-ch-ua']) {
			return res.status(403).json({ ok: false, error: 'FORBIDDEN' });
		}
		const token = extractBearerToken(req.headers.authorization);
		if (!token) return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });

		if (!timingSafeEqual(token, internalSecret)) {
			return res.status(401).json({ ok: false, error: 'UNAUTHORIZED' });
		}

		return next();
	};
}

export function createInternalRouter(options: { io: IoServer; sessionStore: SessionStore; internalSecret: string }) {
	const { io, sessionStore, internalSecret } = options;
	const router = Router();
	router.use(internalAuth(internalSecret));

	router.post('/emit', (req: Request, res: Response) => {
		const { userId, event, payload } = (req.body || {}) as Record<string, unknown>;
		if (typeof userId !== 'string' || !OBJECT_ID_REGEX.test(userId)) {
			return res.status(400).json({ ok: false, error: 'INVALID_USER_ID' });
		}
		if (typeof event !== 'string' || !SUPPORTED_USER_EVENTS.has(event as SupportedUserEvent)) {
			return res.status(400).json({ ok: false, error: 'INVALID_EVENT' });
		}

		io.to(userRoom(userId)).emit(event as SupportedUserEvent, payload);
		return res.json({ ok: true });
	});

	router.post('/force-logout', async (req: Request, res: Response) => {
		const { userId, sessionId } = (req.body || {}) as Record<string, unknown>;
		if (typeof userId !== 'string' || !OBJECT_ID_REGEX.test(userId)) {
			return res.status(400).json({ ok: false, error: 'INVALID_USER_ID' });
		}
		if (typeof sessionId !== 'string' || !UUID_REGEX.test(sessionId)) {
			return res.status(400).json({ ok: false, error: 'INVALID_SESSION_ID' });
		}

		try {
			await sessionStore.setActiveSession(userId, sessionId);
		} catch {
			return res.status(503).json({ ok: false, error: 'REDIS_UNAVAILABLE' });
		}

		let sockets: Awaited<ReturnType<IoServer['fetchSockets']>>;
		try {
			sockets = await io.in(userRoom(userId)).fetchSockets();
		} catch {
			return res.status(500).json({ ok: false, error: 'FETCH_SOCKETS_FAILED' });
		}
		let disconnected = 0;

		for (const socket of sockets) {
			if (socket.data?.session_id === sessionId) continue;
			socket.emit('auth:logout', { reason: 'SESSION_REPLACED' });
			setTimeout(() => socket.disconnect(true), 10);
			disconnected += 1;
		}

		return res.json({ ok: true, disconnected });
	});

	return router;
}
