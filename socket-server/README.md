# Socket Server (TypeScript + Socket.IO)

Dedicated real-time Socket Server for `bot-customer-service` (no DB, no login/business logic).

## Features
- Express HTTP server (internal routes only)
- Socket.IO initialization
- JWT authentication in Socket.IO handshake (`src/helper/check_jwt.ts`)
- Per-user room auto-join: `user:{user_id}`
- Single-login enforcement via Redis (stores active `session_id` per `user_id`)
- Internal routes (protected by `INTERNAL_SECRET`) to:
  - emit supported events to a user
  - force-logout old sessions

## Quick start
1. Install dependencies:

```powershell
npm install
```

2. Run in development mode (auto-restarts on change):

```powershell
npm run dev
```

3. Build and start:

```powershell
npm run build
npm start
```

## Environment variables
- `PORT`: server port (defaults to `3000`)
- `JWT_SECRET` (required): secret used to verify JWTs
- `JWT_ALGORITHMS` (optional): comma-separated list (defaults to `HS256`)
- `CORS_ORIGIN` (optional): `*` or comma-separated origins (defaults to `*`)
- `INTERNAL_SECRET` (recommended): Bearer token required for all `/internal/*` routes (fallbacks: `AUTH_TOKEN`, then `SECRET_KEY`)
- `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASS`: Redis connection (required for session enforcement)

## Socket authentication (website client)
This server accepts a JWT **only** during the Socket.IO handshake and rejects unauthenticated connections.
The JWT payload must include:
- `user_id` (MongoDB ObjectId string)
- `session_id` (UUID string)

Example (browser):
```ts
import { io } from "socket.io-client";

const socket = io("http://localhost:3100", {
  auth: { token: yourJwt },
});
```

On successful handshake the server:
- attaches `user_id` and `session_id` to the socket
- joins room `user:{user_id}`

## Internal routes (API server -> socket server)
All internal routes require `Authorization: Bearer <INTERNAL_SECRET>`.

1) `POST /internal/emit`
```json
{ "userId": "string", "event": "string", "payload": "any" }
```
Emits to room `user:{userId}`. Supported events:
- `profile:update`
- `account:update`
- `auth:logout`

2) `POST /internal/force-logout`
```json
{ "userId": "string", "sessionId": "string" }
```
Sets the active `sessionId` and disconnects all sockets for the user except that session (emits `auth:logout` first).

## Files
- `src/server.ts` - Express + HTTP server + graceful shutdown
- `src/socket.ts` - Socket.IO initialization and per-user room join
- `src/middleware.ts` - JWT handshake authentication middleware
- `src/routes/internal.ts` - `/internal/emit` and `/internal/force-logout`
