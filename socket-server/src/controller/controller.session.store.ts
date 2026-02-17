import { EXPIRE_TOKEN_TIME } from '../constants';
import { eLog } from '../utils/util';

interface SessionData {
	sessionId: string;
	timeoutId: NodeJS.Timeout;
}

class ControllerSessionStore {
	private readonly keyPrefix = 'socket:active_session:';
	private store = new Map<string, SessionData>();

	private key(userId: string) {
		return `${this.keyPrefix}${userId}`;
	}

	private clearSessionTimeout(key: string) {
		const existing = this.store.get(key);
		if (existing && existing.timeoutId) {
			clearTimeout(existing.timeoutId);
		}
	}

	private setWithExpiration(key: string, sessionId: string) {
		this.clearSessionTimeout(key);
		const expirationMs = EXPIRE_TOKEN_TIME * 1000;

		const timeoutId = setTimeout(() => {
			this.store.delete(key);
		}, expirationMs);
		timeoutId.unref?.();
		this.store.set(key, { sessionId, timeoutId });
	}

	public async getActiveSession(userId: string): Promise<string | undefined> {
		const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
		if (!normalizedUserId) {
			throw new Error('INVALID_USER_ID');
		}
		try {
			const sessionData = this.store.get(this.key(normalizedUserId));
			return sessionData?.sessionId;
		} catch (error) {
			eLog('SessionStore getActiveSession failed:', error);
			throw error;
		}
	}

	public async assertOrAdopt(userId: string, sessionId: string): Promise<{ ok: true } | { ok: false; reason: 'SESSION_MISMATCH' }> {
		const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
		const normalizedSessionId = typeof sessionId === 'string' ? sessionId.trim() : '';
		if (!normalizedUserId || !normalizedSessionId) {
			return { ok: false, reason: 'SESSION_MISMATCH' };
		}

		const key = this.key(normalizedUserId);
		try {
			const sessionData = this.store.get(key);
			if (!sessionData) {
				this.setWithExpiration(key, normalizedSessionId);
				return { ok: true };
			}
			if (sessionData.sessionId !== normalizedSessionId) {
				return { ok: false, reason: 'SESSION_MISMATCH' };
			}
			this.setWithExpiration(key, normalizedSessionId);
			return { ok: true };
		} catch (error) {
			eLog('SessionStore assertOrAdopt failed:', error);
			throw error;
		}
	}

	public async setActiveSession(userId: string, sessionId: string) {
		const normalizedUserId = typeof userId === 'string' ? userId.trim() : '';
		const normalizedSessionId = typeof sessionId === 'string' ? sessionId.trim() : '';
		if (!normalizedUserId || !normalizedSessionId) {
			throw new Error('INVALID_SESSION');
		}
		try {
			this.setWithExpiration(this.key(normalizedUserId), normalizedSessionId);
		} catch (error) {
			eLog('SessionStore setActiveSession failed:', error);
			throw error;
		}
	}
}

const sessionStore = new ControllerSessionStore();
export default sessionStore;
