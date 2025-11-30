import express from 'express';
import { roomControllers } from '../controllers/roomControllers.js';
import { validateJWT } from '../middleware/validateJWT.js';

const roomRouter = express.Router();

roomRouter.get('/', roomControllers.getRooms);
roomRouter.get('/:id', roomControllers.getRoom);
roomRouter.post('/', validateJWT, roomControllers.addRoom);
roomRouter.patch('/:id', validateJWT, roomControllers.modifyRoom);
roomRouter.delete('/:id', validateJWT, roomControllers.deleteRoom);
roomRouter.post('/:id/verify', roomControllers.verifyPassword);
roomRouter.post('/:id/guess', roomControllers.submitGuess);

export { roomRouter };

