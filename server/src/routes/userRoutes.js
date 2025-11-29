import express from 'express';
import { userControllers } from '../controllers/userControllers.js';

const userRouter = express.Router();

userRouter.get('/', userControllers.getUsers);
userRouter.get('/:id', userControllers.getUser);
userRouter.post('/', userControllers.addUser);
userRouter.patch('/:id', userControllers.modifyUser);
userRouter.delete('/:id', userControllers.deleteUser);

export { userRouter };

