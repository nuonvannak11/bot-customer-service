export type SupportedUserEvent = 'profile:update' | 'account:update' | 'auth:logout';

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

