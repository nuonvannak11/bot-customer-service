# Socket Server (TypeScript + Socket.IO)

This project provides a minimal Socket.IO server implementation in TypeScript intended for a bot-customer-service platform.

## Features
- Express HTTP server
- Socket.IO socket initialization
- Handshake token middleware
- Basic events: join, message, typing

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
- PORT: server port (defaults to 3000)
- AUTH_TOKEN: optional token required for socket connections

## Files
- `src/server.ts` - Express + HTTP server
- `src/socket.ts` - Socket.IO initialization
- `src/middleware.ts` - Handshake middleware for auth
- `src/events.ts` - Event handlers
