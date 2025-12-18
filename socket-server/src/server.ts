import express from 'express';
import http from 'http';
import cors from 'cors';
import { initSocket } from './socket';
import { get_env ,eLog} from './utils/util';

const PORT = get_env("PORT", 3000);
console.log(PORT);
const app = express();

app.use(cors());
app.get('/', (_req, res) => res.send({ ok: true, message: 'Socket server running' }));

const server = http.createServer(app);
const io = initSocket(server);

server.listen(PORT, () => {
	eLog(`Server listening on port ${PORT}`);
});

export { app, server, io };

