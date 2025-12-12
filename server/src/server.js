import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { pathToFileURL } from 'url';
import { userRouter } from './routes/userRoutes.js';
import { roomRouter } from './routes/roomRoutes.js';
import { authRouter } from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initGameSocket } from './socket/gameSocket.js';

dotenv.config();

export const createApp = ({ serverPath } = {}) => {
  const resolvedServerPath = serverPath || process.env.SERVER_DIR || path.resolve(import.meta.dirname, '..');
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.use('/api/users', userRouter);
  app.use('/api/rooms', roomRouter);
  app.use('/api/auth', authRouter);

  app.use(express.static(path.join(resolvedServerPath, 'client/build')));

  app.get('/', (req, res) => {
    res.sendFile(path.join(resolvedServerPath, 'client/build/index.html'));
  });

  app.use(errorHandler);

  return app;
};

export const createServer = ({ app, initSocket = true } = {}) => {
  const resolvedApp = app || createApp();
  const server = http.createServer(resolvedApp);

  const io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  if (initSocket) {
    initGameSocket(io);
  }

  return { app: resolvedApp, server, io };
};

export const startServer = ({ port, serverPath, initSocket = true } = {}) => {
  const resolvedPort = port || process.env.PORT || 6790;
  const { app, server, io } = createServer({ app: createApp({ serverPath }), initSocket });
  server.listen(resolvedPort, () => {
    console.log(`Wordle server running on port ${resolvedPort}`);
  });
  return { app, server, io };
};

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  startServer();
}

