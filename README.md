# Real-time Multiplayer Wordle

A real-time multiplayer Wordle game: users can create rooms, join with friends, and take turns guessing a five-letter word together.

## Repo structure

This project is organized as a backend plus a React client that lives inside the server folder:

```
wordle/
|  server/                 # Node/Express API + Socket.IO server
|  |  src/                 # server source
|  |  client/              # React app (CRA)
```

## Tech stack

- Backend: Node.js, Express, MongoDB, Socket.IO, JWT (RS256), bcrypt
- Frontend: React (CRA), react-router, socket.io-client

## Requirements

- Node.js >= 18
- npm
- MongoDB (local or hosted, e.g. MongoDB Atlas)

## Environment variables

Create `wordle/server/.env` (or set these vars in your deployment environment):

```
MONGO_URI=mongodb://127.0.0.1:27017
DB_NAME=wordle
PORT=6790
JWT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----
JWT_PUBLIC_KEY=-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----
```

Supported server environment variables:

- `MONGO_URI` (required): Mongo connection string (local or Atlas)
- `DB_NAME` (required): Mongo database name
- `PORT` (optional): server port (default `6790`)
- `JWT_PRIVATE_KEY` (required unless `JWT_PRIVATE_KEY_PATH` is used): RSA private key (PEM)
- `JWT_PUBLIC_KEY` (required unless `JWT_PUBLIC_KEY_PATH` is used): RSA public key (PEM)
- `JWT_PRIVATE_KEY_PATH` (optional): path to RSA private key file
- `JWT_PUBLIC_KEY_PATH` (optional): path to RSA public key file
- `SERVER_DIR` (optional): override the directory used to serve the built React app (defaults to the `server/` directory)


## JWT keys (RS256)

You must provide an RSA keypair (do not commit your private key). Example (OpenSSL):

```bash
openssl genpkey -algorithm RSA -out jwtRS256.key -pkeyopt rsa_keygen_bits:2048
openssl rsa -in jwtRS256.key -pubout -out jwtRS256.key.pub
```

Then either:

- paste PEM contents into `JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY`, or
- set `JWT_PRIVATE_KEY_PATH` / `JWT_PUBLIC_KEY_PATH` to point to those files.

## Third-party services / accounts

- MongoDB: you need a MongoDB instance (local MongoDB or a hosted cluster like MongoDB Atlas). No other paid accounts are required.
- Random word source: the server tries `random-word-api.vercel.app` (no API key). If it fails, it falls back to a small built-in word list.

## Install

```bash
cd wordle/server
npm install

cd client
npm install
```

## Run (local)

### 1) Start MongoDB

Make sure MongoDB is running and your `MONGO_URI`/`DB_NAME` are correct.

### 2) Start the backend

```bash
cd wordle/server
npm start
```

Server: `http://localhost:6790`

### Option A (simplest): run server only (serves the built client)

Build the client once, then start the server:

```bash
cd wordle/server/client
npm run build

cd ../
npm start
```

Open: `http://localhost:6790`

### Option B: run React dev server separately (UI development)

```bash
cd wordle/server/client
npm start
```

Client: `http://localhost:3000` (requires client-to-server configuration such as a proxy or `REACT_APP_API_BASE`)

## Build (production)

Build the React app and serve it from the Node server:

```bash
cd wordle/server/client
npm run build

cd ../
npm start
```

Then open: `http://localhost:6790`

## Tests

```bash
cd wordle/server
npm test
npm run coverage
```

## Deploy

You can deploy this as a single Node service that serves the API, Socket.IO, and the built React app:

1. Provision MongoDB (Atlas or similar) and set `MONGO_URI` + `DB_NAME`.
2. Configure JWT keypair via env vars (`JWT_PRIVATE_KEY` / `JWT_PUBLIC_KEY`) or key paths.
3. Build the client (`npm run build` under `wordle/server/client`).
4. Start the server (`npm start` under `wordle/server`).


## API endpoints

All REST endpoints are under `/api`:

### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`

### Users
- `GET /api/users`
- `GET /api/users/:id`
- `POST /api/users`
- `PATCH /api/users/:id` (JWT required)
- `DELETE /api/users/:id` (JWT required)

### Rooms
- `GET /api/rooms`
- `GET /api/rooms/:id`
- `POST /api/rooms` (JWT required)
- `PATCH /api/rooms/:id` (JWT required, creator only)
- `DELETE /api/rooms/:id` (JWT required, creator only)
- `POST /api/rooms/:id/verify`
- `POST /api/rooms/:id/guess`

## Socket.IO events

### Client -> Server
- `joinGame`
- `submitGuess`

### Server -> Client
- `gameState`
- `playerJoined`
- `playerLeft`
- `gameOver`
- `error`

