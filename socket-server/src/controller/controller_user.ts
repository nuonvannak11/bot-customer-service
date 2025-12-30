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

        subscriber.on('connect', () => eLog('Redis subscriber connected'));
        subscriber.on('error', (err) => eLog('Redis subscriber error:', err));
        subscriber.on('message', (channel, message) => {
            const data = this.parseControlMessage(message);
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

        void subscriber
            .subscribe(channels.emit, channels.forceLogout, channels.kick)
            .then(() => eLog(`Redis control subscribed to ${channels.emit}, ${channels.forceLogout}, ${channels.kick}`))
            .catch((error) => eLog('Redis control subscribe failed:', error));

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
        } catch {
            return null;
        }
    }

    private readEncryptedFlag(value: unknown): boolean {
        if (typeof value === 'boolean') return value;
        return true;
    }

    private decodeString(value: unknown, encrypted: boolean): string | null {
        if (typeof value !== 'string') return null;
        const raw = encrypted ? hash_data.decryptData(value) : value;
        if (empty(raw)) return null;
        return raw.trim();
    }

    private decodePayload(value: unknown, encrypted: boolean): unknown | null {
        if (!encrypted) {
            return empty(value) ? null : value;
        }
        if (typeof value !== 'string') return null;
        const raw = hash_data.decryptData(value);
        if (empty(raw)) return null;
        return raw;
    }

    private async handleControlEmit(io: IoServer, data: Record<string, unknown>) {
        const userId = this.decodeString(data.user_id, true);
        const session_id = this.decodeString(data.session_id, false);
        const event = this.decodeString(data.event, false);
        const payload = this.decodePayload(data.payload, false);
        if (!userId || !event || payload === null) {
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
            setTimeout(() => socket.disconnect(true), this.disconnectDelayMs);
            disconnected += 1;
        }
        return disconnected;
    }
}

export default new UserController;
