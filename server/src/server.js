import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { userRouter } from './routes/userRoutes.js';
import { roomRouter } from './routes/roomRoutes.js';
import { authRouter } from './routes/authRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initGameSocket } from './socket/gameSocket.js';

dotenv.config();

const serverPath = process.env.SERVER_DIR || import.meta.dirname;
const port = process.env.PORT || 6790;
const app = express();
const server = http.createServer(app);

app.use(cors());
app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

initGameSocket(io);

app.use('/api/users', userRouter);
app.use('/api/rooms', roomRouter);
app.use('/api/auth', authRouter);

app.use(
  express.static(
    path.join(
      serverPath, '../client/build')
));


app.get('/', (req, res) => {
  res.sendFile(
    path.join(
      serverPath, '../client/build/index.html'));
});

app.use(errorHandler);

server.listen(port, () => {
  console.log(`Wordle server running on port ${port}`);
});

