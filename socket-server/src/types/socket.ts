export const supportedUserEvents = ['profile:update', 'account:update', 'auth:logout'] as const;
export type SupportedUserEvent = typeof supportedUserEvents[number];

export function isSupportedUserEvent(value: string): value is SupportedUserEvent {
	return (supportedUserEvents as readonly string[]).includes(value);
}

export interface ServerToClientEvents {
	'profile:update': (payload: unknown) => void;
	'account:update': (payload: unknown) => void;
	'auth:logout': (payload?: { reason?: string }) => void;
}

export interface ClientToServerEvents { }

export interface InterServerEvents { }

export interface SocketData {
	user_id: string;
	session_id: string;
}

