import express from 'express';
import { authControllers } from '../controllers/authControllers.js';

const authRouter = express.Router();

authRouter.post('/register', authControllers.register);
authRouter.post('/login', authControllers.login);

export { authRouter };

