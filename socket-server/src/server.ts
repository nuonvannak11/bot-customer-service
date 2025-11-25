import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { initSocket } from './socket';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(cors());
app.get('/', (_req, res) => res.send({ ok: true, message: 'Socket server running' }));

const server = http.createServer(app);
const io = initSocket(server);

server.listen(PORT, () => {
	// eslint-disable-next-line no-console
	console.log(`Server listening on port ${PORT}`);
});

export { app, server, io };

