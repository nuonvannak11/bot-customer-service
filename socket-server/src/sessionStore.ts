import redisController from './controller/controller_redis';
import { EXPIRE_TOKEN_TIME } from './constants';
import { eLog } from './utils/util';

export class SessionStore {
	private readonly keyPrefix = 'socket:active_session:';

	private key(userId: string) {
		return `${this.keyPrefix}${userId}`;
	}

	public async getActiveSession(userId: string): Promise<string | undefined> {
		const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
		if (!normalizedUserId) {
			// Fix: reject empty/whitespace user_id before hitting Redis.
			throw new Error('INVALID_USER_ID');
		}
		try {
			const active = await redisController.getOrThrow<string>(this.key(normalizedUserId));
			return active ?? undefined;
		} catch (error) {
			eLog('SessionStore getActiveSession failed:', error); // Fix: add try/catch around async Redis calls.
			throw error;
		}
	}

	public async assertOrAdopt(userId: string, sessionId: string): Promise<{ ok: true } | { ok: false; reason: 'SESSION_MISMATCH' }> {
		const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
		const normalizedSessionId = typeof sessionId === 'string' ? sessionId.trim() : '';
		if (!normalizedUserId || !normalizedSessionId) {
			// Fix: reject empty/whitespace user_id/session_id.
			return { ok: false, reason: 'SESSION_MISMATCH' };
		}
		const key = this.key(normalizedUserId);
		try {
			const active = await redisController.getOrThrow<string>(key);
			if (!active) {
				const adopted = await redisController.setIfMissingOrMatch(key, normalizedSessionId, EXPIRE_TOKEN_TIME);
				return adopted ? { ok: true } : { ok: false, reason: 'SESSION_MISMATCH' };
			}
			if (active !== normalizedSessionId) return { ok: false, reason: 'SESSION_MISMATCH' };
			const refreshed = await redisController.setIfMissingOrMatch(key, normalizedSessionId, EXPIRE_TOKEN_TIME);
			// Fix: atomic session refresh to prevent race conditions.
			return refreshed ? { ok: true } : { ok: false, reason: 'SESSION_MISMATCH' };
		} catch (error) {
			eLog('SessionStore assertOrAdopt failed:', error); // Fix: add try/catch around async Redis calls.
			throw error;
		}
	}

	public async setActiveSession(userId: string, sessionId: string) {
		const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
		const normalizedSessionId = typeof sessionId === 'string' ? sessionId.trim() : '';
		if (!normalizedUserId || !normalizedSessionId) {
			// Fix: reject empty/whitespace user_id/session_id.
			throw new Error('INVALID_SESSION');
		}
		try {
			await redisController.set(this.key(normalizedUserId), normalizedSessionId, EXPIRE_TOKEN_TIME);
		} catch (error) {
			eLog('SessionStore setActiveSession failed:', error); // Fix: add try/catch around async Redis calls.
			throw error;
		}
	}
}
