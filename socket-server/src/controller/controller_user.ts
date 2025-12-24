import { type Request, type Response } from 'express';
import type { IoServer } from '../socket';
import { SessionStore } from '../sessionStore';
import type { SupportedUserEvent } from '../types/socket';
import hash_data from '../helper/hash_data';
import { empty } from '../utils/util';

class UserController {
    userRoom(userId: string) {
        return `user:${userId}`;
    }

    async emit_event(io: IoServer, req: Request, res: Response) {
        const { userId, event, payload } = (req.body || {}) as Record<string, unknown>;
        try {
            const formatUserId = hash_data.decryptData(userId as string);
            const formatEvent = hash_data.decryptData(event as string);
            const formatPayload = hash_data.decryptData(payload as string);
            if (empty(formatUserId) || empty(formatEvent) || empty(formatPayload)) {
                return res.status(200).json({ ok: false, message: 'INVALID_REQUEST_BODY' });
            }
            io.to(this.userRoom(formatUserId)).emit(formatEvent as SupportedUserEvent, formatPayload);
            return res.status(200).json({ ok: true, message: 'EVENT_EMITTED' });
        } catch (error) {
            return res.status(200).json({ ok: false, message: 'INTERNAL_SERVER_ERROR' });
        }
    }

    async force_logout(io: IoServer, sessionStore: SessionStore, req: Request, res: Response) {
        const { userId, sessionId } = (req.body || {}) as Record<string, unknown>;
        try {
            const formatUserId = hash_data.decryptData(userId as string);
            const formatsessionId = hash_data.decryptData(sessionId as string);
            if (empty(formatUserId) || empty(formatsessionId)) {
                return res.status(200).json({ ok: false, message: 'INVALID_REQUEST_BODY' });
            }
            try {
                await sessionStore.setActiveSession(formatUserId, formatsessionId);
            } catch {
                return res.status(200).json({ ok: false, message: 'REDIS_UNAVAILABLE' });
            }

            let sockets: Awaited<ReturnType<IoServer['fetchSockets']>>;
            try {
                sockets = await io.in(this.userRoom(formatUserId)).fetchSockets();
            } catch {
                return res.status(200).json({ ok: false, message: 'FETCH_SOCKETS_FAILED' });
            }

            let disconnected = 0;
            for (const socket of sockets) {
                if (socket.data?.session_id === sessionId) continue;
                socket.emit('auth:logout', { reason: 'SESSION_REPLACED' });
                setTimeout(() => socket.disconnect(true), 10);
                disconnected += 1;
            }
            return res.status(200).json({ ok: true, message: disconnected });
        } catch (error) {
            return res.status(200).json({ ok: false, message: 'INTERNAL_SERVER_ERROR' });
        }
    }
}
export default new UserController;