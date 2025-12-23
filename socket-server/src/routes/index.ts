import type { Application } from 'express';
import { createInternalRouter } from './internal';
import type { IoServer } from '../socket';
import { SessionStore } from '../sessionStore';

export default function setUpRoutes(
	app: Application,
	options: {
		io: IoServer;
		sessionStore: SessionStore;
		internalSecret: string;
	}
) {
	app.use('/internal', createInternalRouter(options));
}
