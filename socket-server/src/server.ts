import express from 'express';
import http from 'http';
import cors from 'cors';
import { initSocket } from './socket';
import { get_env ,eLog} from './utils/util';
import setUpRoutes from './routes';

const PORT = get_env("PORT", 3000);
console.log(PORT);
const app = express();

app.use(cors());

setUpRoutes(app);

const server = http.createServer(app);
const io = initSocket(server);

server.listen(PORT, () => {
	eLog(`Server listening on port ${PORT}`);
});

export { app, server, io };

