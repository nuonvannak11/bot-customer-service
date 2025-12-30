import express from 'express';
import http from 'http';
import { initSocket } from './socket';
import { eLog } from './utils/util';
import { get_env } from './utils/get_env';
import { SessionStore } from './sessionStore';
import redis_subscriber from './controller/controller_user';

const PORT = get_env("PORT", 3200);
const app = express();

app.use(express.json({ limit: '1mb' }));

const sessionStore = new SessionStore();

const server = http.createServer(app);
const io = initSocket(server, sessionStore);

const controlSubscriber = redis_subscriber.startSocketControlSubscriber(io, sessionStore);

server.listen(PORT, () => {
	eLog(`Server listening on port ${PORT}`);
});

function shutdown(signal: string) {
	eLog(`Shutting down (${signal})...`);
	void controlSubscriber.quit();
	io.close();
	server.close(() => process.exit(0));
	setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { app, server, io };
