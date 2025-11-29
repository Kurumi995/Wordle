import express from 'express';
import { roomControllers } from '../controllers/roomControllers.js';

const roomRouter = express.Router();

roomRouter.get('/', roomControllers.getRooms);
roomRouter.get('/:id', roomControllers.getRoom);
roomRouter.post('/', roomControllers.addRoom);
roomRouter.patch('/:id', roomControllers.modifyRoom);
roomRouter.delete('/:id', roomControllers.deleteRoom);

export { roomRouter };

