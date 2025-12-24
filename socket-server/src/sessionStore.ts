import redisController from './controller/controller_redis';
import { EXPIRE_TOKEN_TIME } from './constants';

export class SessionStore {
	private readonly keyPrefix = 'socket:active_session:';

	private key(userId: string) {
		return `${this.keyPrefix}${userId}`;
	}

	public async getActiveSession(userId: string): Promise<string | undefined> {
		const active = await redisController.getOrThrow<string>(this.key(userId));
		return active ?? undefined;
	}

	public async assertOrAdopt(
		userId: string,
		sessionId: string
	): Promise<{ ok: true } | { ok: false; reason: 'SESSION_MISMATCH' }> {
		const key = this.key(userId);
		const active = await redisController.getOrThrow<string>(key);
		if (!active) {
			const adopted = await redisController.setIfNotExists(key, sessionId, EXPIRE_TOKEN_TIME);
			if (adopted) return { ok: true };

			const after = await redisController.getOrThrow<string>(key);
			if (!after) {
				await redisController.set(key, sessionId, EXPIRE_TOKEN_TIME);
				return { ok: true };
			}
			if (after !== sessionId) return { ok: false, reason: 'SESSION_MISMATCH' };
			return { ok: true };
		}
		if (active !== sessionId) return { ok: false, reason: 'SESSION_MISMATCH' };
		await redisController.set(key, sessionId, EXPIRE_TOKEN_TIME);
		return { ok: true };
	}

	public async setActiveSession(userId: string, sessionId: string) {
		await redisController.set(this.key(userId), sessionId, EXPIRE_TOKEN_TIME);
	}
}
