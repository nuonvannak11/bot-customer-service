import type { IoServer } from '../lib/socket';
import sessionStore from './controller.session.store';
import { isSupportedUserEvent } from '../types/socket';
import { eLog, empty, generateSessionId } from '../utils/util';

class UserController {
	private userRoom(userId: string) {
		return `user:${userId}`;
	}

	private normalize(value: unknown): string {
		return typeof value === 'string' ? value.trim() : '';
	}

	private async disconnectUserSockets(io: IoServer, userId: string, reason: string, excludeSessionId?: string): Promise<number> {
		const sockets = await io.in(this.userRoom(userId)).fetchSockets();
		let disconnected = 0;
		for (const socket of sockets) {
			if (excludeSessionId && socket.data?.session_id === excludeSessionId) continue;
			socket.emit('auth:logout', { reason });
			socket.disconnect(true);
			disconnected += 1;
		}
		return disconnected;
	}

	public async emitUserEvent(io: IoServer, userId: string, event: string, payload: unknown): Promise<boolean> {
		const normalizedUserId = this.normalize(userId);
		const normalizedEvent = this.normalize(event);
		if (!normalizedUserId || !normalizedEvent || empty(payload)) {
			return false;
		}
		if (!isSupportedUserEvent(normalizedEvent)) {
			eLog(`Redis control emit ignored: unsupported event=${normalizedEvent}`);
			return false;
		}
		io.to(this.userRoom(normalizedUserId)).emit(normalizedEvent, payload);
		eLog(`Redis control emit event=${normalizedEvent} user=${normalizedUserId}`);
		return true;
	}

	public async forceLogoutUser(io: IoServer, userId: string, sessionId: string): Promise<boolean> {
		const normalizedUserId = this.normalize(userId);
		const normalizedSessionId = this.normalize(sessionId);
		if (!normalizedUserId || !normalizedSessionId) {
			return false;
		}
		try {
			await sessionStore.setActiveSession(normalizedUserId, normalizedSessionId);
		} catch (error) {
			eLog('Redis control force-logout failed to set session:', error);
			return false;
		}
		try {
			const disconnected = await this.disconnectUserSockets(io, normalizedUserId, 'SESSION_REPLACED', normalizedSessionId);
			eLog(`Redis control force-logout disconnected=${disconnected} user=${normalizedUserId}`);
			return true;
		} catch (error) {
			eLog('Redis control force-logout failed to fetch sockets:', error);
			return false;
		}
	}

	public async kickUser(io: IoServer, userId: string, reason = 'KICKED', invalidateSession = false): Promise<boolean> {
		const normalizedUserId = this.normalize(userId);
		const normalizedReason = this.normalize(reason) || 'KICKED';
		if (!normalizedUserId) {
			return false;
		}
		if (invalidateSession) {
			try {
				await sessionStore.setActiveSession(normalizedUserId, generateSessionId());
			} catch (error) {
				eLog('Redis control kick failed to invalidate session:', error);
			}
		}
		try {
			const disconnected = await this.disconnectUserSockets(io, normalizedUserId, normalizedReason);
			eLog(`Redis control kick disconnected=${disconnected} user=${normalizedUserId}`);
			return true;
		} catch (error) {
			eLog('Redis control kick failed to fetch sockets:', error);
			return false;
		}
	}
}

const userController = new UserController;
export default userController;