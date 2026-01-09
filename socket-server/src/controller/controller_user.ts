import redis from '../config/redis';
import { get_env } from '../utils/get_env';
import type { IoServer } from '../socket';
import { SessionStore } from '../sessionStore';
import { isSupportedUserEvent } from '../types/socket';
import hash_data from '../helper/hash_data';
import { eLog, empty, generateSessionId } from '../utils/util';

type SocketControlChannels = {
    emit: string;
    forceLogout: string;
    kick: string;
};

class UserController {
    private readonly disconnectDelayMs = 10;

    userRoom(userId: string) {
        return `user:${userId}`;
    }

    startSocketControlSubscriber(io: IoServer, sessionStore: SessionStore) {
        const channels = this.getControlChannels();
        const subscriber = redis.duplicate();
        let isSubscribed = false;
        let isSubscribing = false;

        const subscribeToChannels = async (source: string) => {
            if (isSubscribed || isSubscribing) return;
            isSubscribing = true;
            try {
                await subscriber.subscribe(channels.emit, channels.forceLogout, channels.kick);
                isSubscribed = true;
                eLog(`Redis control subscribed to ${channels.emit}, ${channels.forceLogout}, ${channels.kick} source=${source}`); // Fix: ensure re-subscribe visibility.
            } catch (error) {
                isSubscribed = false;
                eLog('Redis control subscribe failed:', error);
            } finally {
                isSubscribing = false;
            }
        };

        subscriber.on('connect', () => eLog('Redis subscriber connected'));
        subscriber.on('ready', () => {
            eLog('Redis subscriber ready'); // Fix: track readiness for reconnect recovery.
            void subscribeToChannels('ready');
        });
        subscriber.on('reconnecting', () => {
            isSubscribed = false; // Fix: ensure re-subscribe after reconnect.
            eLog('Redis subscriber reconnecting');
        }); // Fix: reconnect handler for observability.
        subscriber.on('end', () => {
            isSubscribed = false; // Fix: force re-subscribe after reconnect.
            eLog('Redis subscriber end');
        });
        subscriber.on('close', () => {
            isSubscribed = false; // Fix: force re-subscribe after reconnect.
            eLog('Redis subscriber close');
        });
        subscriber.on('error', (err) => eLog('Redis subscriber error:', err));
        subscriber.on('message', (channel, message) => {
            let data: Record<string, unknown> | null = null;
            try {
                data = this.parseControlMessage(message); // Fix: guard JSON.parse with try/catch.
            } catch (error) {
                eLog(`Redis control parse error on ${channel}:`, error);
                return;
            }
            if (!data) {
                eLog(`Redis control ignored: invalid JSON on ${channel}`);
                return;
            }
            if (channel === channels.emit) {
                void this.handleControlEmit(io, data);
                return;
            }
            if (channel === channels.forceLogout) {
                void this.handleControlForceLogout(io, sessionStore, data);
                return;
            }
            if (channel === channels.kick) {
                void this.handleControlKick(io, sessionStore, data);
                return;
            }
        });

        void subscribeToChannels('start'); // Fix: centralized subscribe + re-subscribe handling.

        return subscriber;
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

    private parseControlMessage(message: string): Record<string, unknown> | null {
        try {
            const parsed = JSON.parse(message) as unknown;
            if (!parsed || typeof parsed !== 'object') return null;
            return parsed as Record<string, unknown>;
        } catch (error) {
            eLog('Redis control JSON.parse failed:', error); // Fix: log JSON.parse failures.
            return null;
        }
    }

    private readEncryptedFlag(value: unknown): boolean {
        // Fix: only boolean true means encrypted; all other values are treated as plaintext.
        return value === true;
    }

    private decodeString(value: unknown, encrypted: boolean): string | null {
        if (typeof value !== 'string') return null;
        try {
            const raw = encrypted ? hash_data.decryptData(value) : value;
            if (raw == null || empty(raw)) return null;
            return raw.trim();
        } catch (error) {
            // Fix: catch decrypt failures (tampered ciphertext) and reject the value.
            eLog('Redis control decrypt string failed:', error);
            return null;
        }
    }

    private decodePayload(value: unknown, encrypted: boolean): unknown | null {
        if (!encrypted) {
            // Fix: allow 0/false/{}[] payloads; only null/undefined are rejected.
            return value === null || value === undefined ? null : value;
        }
        if (typeof value !== 'string') return null;
        try {
            const raw = hash_data.decryptData(value);
            if (raw == null) return null;
            return raw;
        } catch (error) {
            // Fix: catch decrypt failures (tampered ciphertext) and reject the payload.
            eLog('Redis control decrypt payload failed:', error);
            return null;
        }
    }

    private async handleControlEmit(io: IoServer, data: Record<string, unknown>) {
        const encrypted = this.readEncryptedFlag(data.encrypted);
        const userId = this.decodeString(data.user_id, encrypted);
        const session_id = this.decodeString(data.session_id, encrypted);
        const event = this.decodeString(data.event, encrypted);
        const payload = this.decodePayload(data.payload, encrypted);
        // Fix: validate user_id/session_id/event/payload using consistent encryption handling.
        if (!userId || !session_id || !event || payload === null) {
            eLog('Redis control emit ignored: invalid payload');
            return;
        }
        if (!isSupportedUserEvent(event)) {
            eLog(`Redis control emit ignored: unsupported event=${event}`);
            return;
        }
        io.to(this.userRoom(userId)).emit(event, payload);
    }

    private async handleControlForceLogout(io: IoServer, sessionStore: SessionStore, data: Record<string, unknown>) {
        const encrypted = this.readEncryptedFlag(data.encrypted);
        const userId = this.decodeString(data.userId, encrypted);
        const sessionId = this.decodeString(data.sessionId, encrypted);
        if (!userId || !sessionId) {
            eLog('Redis control force-logout ignored: invalid payload');
            return;
        }
        try {
            await sessionStore.setActiveSession(userId, sessionId);
        } catch (error) {
            eLog('Redis control force-logout failed to set session:', error);
            return;
        }
        try {
            const disconnected = await this.disconnectUserSockets(io, userId, 'SESSION_REPLACED', sessionId);
            eLog(`Redis control force-logout disconnected=${disconnected} user=${userId}`);
        } catch (error) {
            eLog('Redis control force-logout failed to fetch sockets:', error);
        }
    }

    private async handleControlKick(io: IoServer, sessionStore: SessionStore, data: Record<string, unknown>) {
        const encrypted = this.readEncryptedFlag(data.encrypted);
        const userId = this.decodeString(data.userId, encrypted);
        const reason = this.decodeString(data.reason, encrypted) || 'KICKED';
        const invalidateSession = data.invalidateSession === true;
        if (!userId) {
            eLog('Redis control kick ignored: invalid payload');
            return;
        }
        if (invalidateSession) {
            try {
                await sessionStore.setActiveSession(userId, generateSessionId());
            } catch (error) {
                eLog('Redis control kick failed to invalidate session:', error);
            }
        }
        try {
            const disconnected = await this.disconnectUserSockets(io, userId, reason);
            eLog(`Redis control kick disconnected=${disconnected} user=${userId}`);
        } catch (error) {
            eLog('Redis control kick failed to fetch sockets:', error);
        }
    }

    private async disconnectUserSockets(io: IoServer, userId: string, reason: string, excludeSessionId?: string): Promise<number> {
        const sockets = await io.in(this.userRoom(userId)).fetchSockets();
        let disconnected = 0;
        for (const socket of sockets) {
            if (excludeSessionId && socket.data?.session_id === excludeSessionId) continue;
            socket.emit('auth:logout', { reason });
            socket.disconnect(true); // Fix: avoid per-socket timers under high fan-out.
            disconnected += 1;
        }
        return disconnected;
    }
}

export default new UserController;
