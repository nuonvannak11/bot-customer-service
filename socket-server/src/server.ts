import express from 'express';
import http from 'http';
import { initSocket } from './lib/socket';
import redisSubscribeController from './controller/controller.redis.subscribe';
import { eLog } from './utils/util';
import { get_env } from './utils/get_env';

const PORT = get_env('PORT', 3200);
const app = express();
app.use(express.json({ limit: '1mb' }));

const server = http.createServer(app);
const io = initSocket(server);
redisSubscribeController.start(io);

server.listen(PORT, () => {
	eLog(`Server is running and listening on port ${PORT}`);
});

const shutdown = (signal: NodeJS.Signals) => {
	eLog(`Received ${signal}. Starting graceful shutdown...`);
	const forceExitTimer = setTimeout(() => {
		eLog('Shutdown timeout reached. Forcing exit.');
		process.exit(1);
	}, 10_000).unref();
	void redisSubscribeController.stop().finally(() => {
		io.close(() => {
			eLog('Socket.io connections safely closed.');
			server.close(() => {
				eLog('HTTP server safely closed.');
				clearTimeout(forceExitTimer);
				process.exit(0);
			});
		});
	});
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export { app, server, io };
