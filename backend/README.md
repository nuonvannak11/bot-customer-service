# Bot Customer Service - Backend (Express + TypeScript)

This is a minimal Express backend scaffold configured for TypeScript.

## Commands

- Install dependencies

```powershell
npm install
```

- Run in development (auto-restart)

```powershell
npm run dev
```

- Build (TypeScript -> dist)

```powershell
npm run build
```

- Start built app

```powershell
npm run start
```

## Endpoints

- GET / -> Hello message
- GET /health -> { status: 'ok' }

## Notes

- Update environment variables in a `.env` file if needed, e.g., `PORT=3000`
- You can replace `ts-node-dev` with `nodemon` + `ts-node` or use a containerized setup if you prefer.
