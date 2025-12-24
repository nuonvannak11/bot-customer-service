import crypto from 'crypto';
import { Router, type NextFunction, type Request, type Response } from 'express';
import type { IoServer } from '../socket';
import userController from '../controller/controller_user';
import { safeWithTimeout } from '../utils/util';
import { SessionStore } from '../sessionStore';

interface Options {
	io: IoServer;
	sessionStore: SessionStore;
	internalSecret: string
};

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

export function createInternalRouter(options: Options) {
	const { io, sessionStore, internalSecret } = options;
	const router = Router();
	router.use(internalAuth(internalSecret));

	router.post('/emit', async (req: Request, res: Response, next: NextFunction) => {
		return await safeWithTimeout(userController.emit_event(io, req, res), next);
	});

	router.post('/force-logout', async (req: Request, res: Response, next: NextFunction) => {
		return await safeWithTimeout(userController.force_logout(io, sessionStore, req, res), next);
	});

	return router;
}
