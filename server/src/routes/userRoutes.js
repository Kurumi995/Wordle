import express from 'express';
import { userControllers } from '../controllers/userControllers.js';
import { validateJWT } from '../middleware/validateJWT.js';

const userRouter = express.Router();

userRouter.get('/', userControllers.getUsers);
userRouter.get('/:id', userControllers.getUser);
userRouter.post('/', userControllers.addUser);
userRouter.patch('/:id', validateJWT, userControllers.modifyUser);
userRouter.delete('/:id', validateJWT, userControllers.deleteUser);

export { userRouter };

