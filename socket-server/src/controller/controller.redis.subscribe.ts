import redis from '../config/redis';
import type { IoServer } from '../lib/socket';
import { empty, eLog } from '../utils/util';
import { get_env } from '../utils/get_env';
import userController from './controller_user';
import { cryptoService } from '../lib/crypto';

type SocketControlChannels = {
	emit: string;
	forceLogout: string;
	kick: string;
};

class RedisSubscribeController {
	private subscriber: ReturnType<typeof redis.duplicate> | null = null;
	private isSubscribed = false;
	private isSubscribing = false;

	public start(io: IoServer) {
		if (this.subscriber) return this.subscriber;

		const channels = this.getControlChannels();
		const subscriber = redis.duplicate();
		this.subscriber = subscriber;

		const subscribeToChannels = async (source: string) => {
			if (!this.subscriber || this.subscriber !== subscriber) return;
			if (this.isSubscribed || this.isSubscribing) return;
			this.isSubscribing = true;
			try {
				await subscriber.subscribe(channels.emit, channels.forceLogout, channels.kick);
				this.isSubscribed = true;
				eLog(`Redis control subscribed to ${channels.emit}, ${channels.forceLogout}, ${channels.kick} source=${source}`);
			} catch (error) {
				this.isSubscribed = false;
				eLog('Redis control subscribe failed:', error);
			} finally {
				this.isSubscribing = false;
			}
		};

		subscriber.on('connect', () => eLog('Redis subscriber connected'));
		subscriber.on('ready', () => {
			eLog('Redis subscriber ready');
			void subscribeToChannels('ready');
		});
		subscriber.on('reconnecting', () => {
			eLog('Redis subscriber reconnecting');
		});
		subscriber.on('end', () => {
			this.isSubscribed = false;
			eLog('Redis subscriber end');
		});
		subscriber.on('close', () => {
			this.isSubscribed = false;
			eLog('Redis subscriber close');
		});
		subscriber.on('error', (err) => eLog('Redis subscriber error:', err));
		subscriber.on('message', (channel, message) => {
			void this.handleControlMessage(io, channel, message, channels);
		});

		void subscribeToChannels('start');
		return subscriber;
	}

	public async stop(): Promise<void> {
		const subscriber = this.subscriber;
		this.subscriber = null;
		this.isSubscribed = false;
		this.isSubscribing = false;
		if (!subscriber) return;

		subscriber.removeAllListeners();
		try {
			await subscriber.quit();
		} catch (error) {
			eLog('Redis subscriber quit failed, forcing disconnect:', error);
			subscriber.disconnect();
		}
	}

	private async handleControlMessage(io: IoServer, channel: string, message: string, channels: SocketControlChannels): Promise<void> {
		const data = this.parseControlMessage(channel, message);
		if (!data) return;
		if (channel === channels.emit) {
			await this.handleControlEmit(io, data);
			return;
		}
		if (channel === channels.forceLogout) {
			await this.handleControlForceLogout(io, data);
			return;
		}
		if (channel === channels.kick) {
			await this.handleControlKick(io, data);
		}
	}

	private getControlPrefix(): string {
		const raw = get_env('SOCKET_CONTROL_PREFIX', 'socket:control');
		if (typeof raw !== 'string') return 'socket:control';
		const trimmed = raw.trim();
		return trimmed || 'socket:control';
	}

	private getControlChannels(): SocketControlChannels {
		const prefix = this.getControlPrefix();
		return {
			emit: `${prefix}:emit`,
			forceLogout: `${prefix}:force-logout`,
			kick: `${prefix}:kick`,
		};
	}

	private parseControlMessage(channel: string, message: string): Record<string, unknown> | null {
		try {
			const parsed = JSON.parse(message) as unknown;
			if (!parsed || typeof parsed !== 'object') {
				eLog(`Redis control ignored: invalid JSON on ${channel}`);
				return null;
			}
			return parsed as Record<string, unknown>;
		} catch (error) {
			eLog(`Redis control parse error on ${channel}:`, error);
			return null;
		}
	}

	private readEncryptedFlag(value: unknown): boolean {
		return value === true;
	}

	private decodeString(value: unknown, encrypted: boolean): string | null {
		if (typeof value !== 'string') return null;
		try {
			const raw = encrypted ? cryptoService.decrypt(value) : value;
			if (raw == null || empty(raw)) return null;
			return raw.trim();
		} catch (error) {
			eLog('Redis control decrypt string failed:', error);
			return null;
		}
	}

	private decodePayload(value: unknown, encrypted: boolean): unknown | null {
		if (!encrypted) {
			return value === null || value === undefined ? null : value;
		}
		if (typeof value !== 'string') return null;
		try {
			const raw = cryptoService.decrypt(value);
			if (raw == null) return null;
			return raw;
		} catch (error) {
			eLog('Redis control decrypt payload failed:', error);
			return null;
		}
	}

	private async handleControlEmit(io: IoServer, data: Record<string, unknown>): Promise<void> {
		const encrypted = this.readEncryptedFlag(data.encrypted);
		const userId = this.decodeString(data.user_id, encrypted);
		const event = this.decodeString(data.event, encrypted);
		const payload = this.decodePayload(data.payload, encrypted);
		if (!userId || !event || empty(payload)) {
			eLog('Redis control emit ignored: invalid payload');
			return;
		}
		const ok = await userController.emitUserEvent(io, userId, event, payload);
		if (!ok) {
			eLog('Redis control emit ignored: unsupported/invalid event payload');
		}
	}

	private async handleControlForceLogout(io: IoServer, data: Record<string, unknown>): Promise<void> {
		const encrypted = this.readEncryptedFlag(data.encrypted);
		const userId = this.decodeString(data.userId, encrypted) ?? this.decodeString(data.user_id, encrypted);
		const sessionId = this.decodeString(data.sessionId, encrypted) ?? this.decodeString(data.session_id, encrypted);
		if (!userId || !sessionId) {
			eLog('Redis control force-logout ignored: invalid payload');
			return;
		}
		await userController.forceLogoutUser(io, userId, sessionId);
	}

	private async handleControlKick(io: IoServer, data: Record<string, unknown>): Promise<void> {
		const encrypted = this.readEncryptedFlag(data.encrypted);
		const userId = this.decodeString(data.userId, encrypted) ?? this.decodeString(data.user_id, encrypted);
		const reason = this.decodeString(data.reason, encrypted) || 'KICKED';
		const invalidateSession = data.invalidateSession === true;
		if (!userId) {
			eLog('Redis control kick ignored: invalid payload');
			return;
		}
		await userController.kickUser(io, userId, reason, invalidateSession);
	}
}

export default new RedisSubscribeController();

