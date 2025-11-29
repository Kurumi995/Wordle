import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { userRouter } from './routes/userRoutes.js';
import { roomRouter } from './routes/roomRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

dotenv.config();

const port = process.env.PORT || 6790;
const app = express();

app.use(cors());
app.use(express.json());

app.use('/users', userRouter);
app.use('/rooms', roomRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Wordle server running on port ${port}`);
});

