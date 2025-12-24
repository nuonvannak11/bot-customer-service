import express from 'express';
import http from 'http';
import { initSocket } from './socket';
import { eLog } from './utils/util';
import { get_env } from './utils/get_envs';
import setUpRoutes from './routes';
import { SessionStore } from './sessionStore';

const PORT = get_env("PORT", 3200);
const INTERNAL_SECRET = get_env("SECRET_KEY");
if (!INTERNAL_SECRET) {
	throw new Error('Missing SECRET_KEY) required to access /internal/* routes');
}
const app = express();

app.use(express.json({ limit: '1mb' }));

const sessionStore = new SessionStore();

const server = http.createServer(app);
const io = initSocket(server, sessionStore);

setUpRoutes(app, { io, sessionStore, internalSecret: INTERNAL_SECRET });

server.listen(PORT, () => {
	eLog(`Server listening on port ${PORT}`);
});

function shutdown(signal: string) {
	eLog(`Shutting down (${signal})...`);
	io.close();
	server.close(() => process.exit(0));
	setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { app, server, io };
