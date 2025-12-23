import redisController from './controller/controller_redis';
import { EXPIRE_TOKEN_TIME } from './constants';

/**
 * Redis-backed session registry used to enforce single-login per user.
 *
 * - The API server is responsible for issuing JWTs with (user_id, session_id).
 * - The API server should call POST /internal/force-logout on login to set the
 *   active session_id and force-disconnect older sessions.
 *
 * NOTE: This server MUST NOT connect to MongoDB, so session enforcement is done
 * via Redis (no socket.id stored, no pub/sub required).
 */
export class SessionStore {
	private readonly keyPrefix = 'socket:active_session:';

	private key(userId: string) {
		return `${this.keyPrefix}${userId}`;
	}

	public async getActiveSession(userId: string): Promise<string | undefined> {
		const active = await redisController.getOrThrow<string>(this.key(userId));
		return active ?? undefined;
	}

	/**
	 * Enforces that a user may only connect with the active session_id.
	 *
	 * If no session is known for this user, the first valid session_id is adopted
	 * (race-safe via SET NX).
	 */
	public async assertOrAdopt(
		userId: string,
		sessionId: string
	): Promise<{ ok: true } | { ok: false; reason: 'SESSION_MISMATCH' }> {
		const key = this.key(userId);

		const active = await redisController.getOrThrow<string>(key);
		if (!active) {
			const adopted = await redisController.setIfNotExists(key, sessionId, EXPIRE_TOKEN_TIME);
			if (adopted) return { ok: true };

			// Another request won the race; re-check.
			const after = await redisController.getOrThrow<string>(key);
			if (!after) {
				// Extremely unlikely (key deleted between operations); adopt again.
				await redisController.set(key, sessionId, EXPIRE_TOKEN_TIME);
				return { ok: true };
			}
			if (after !== sessionId) return { ok: false, reason: 'SESSION_MISMATCH' };
			return { ok: true };
		}

		if (active !== sessionId) return { ok: false, reason: 'SESSION_MISMATCH' };

		// Refresh TTL (best-effort) so the active session does not expire while in use.
		await redisController.set(key, sessionId, EXPIRE_TOKEN_TIME);
		return { ok: true };
	}

	/**
	 * Sets the active session_id for a user (used by /internal/force-logout).
	 */
	public async setActiveSession(userId: string, sessionId: string) {
		await redisController.set(this.key(userId), sessionId, EXPIRE_TOKEN_TIME);
	}
}
