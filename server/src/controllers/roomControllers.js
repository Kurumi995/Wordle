import { roomService } from '../services/roomService.js';
import { gameService } from '../services/gameService.js';

const getRooms = async (req, res) => {
  try {
    const allRooms = await roomService.getAll();
    const publicRooms = allRooms.map(room => {
      const { hashedPassword, targetWord, ...publicData } = room;
      return publicData;
    });
    res.json(publicRooms);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

const getRoom = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Id is required' });
  }
  try {
    const theRoom = await roomService.getById(id);
    if (!theRoom) {
      return res.status(404).json({ error: `Room with id ${id} not found.` });
    }
    const { hashedPassword, targetWord, ...publicData } = theRoom;
    res.json(publicData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

const addRoom = async (req, res) => {
  const roomData = {
    ...req.body,
    creatorId: req.userId
  };
  try {
    const result = await roomService.add(roomData);
    res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

const modifyRoom = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Id is required' });
  }
  const updateFields = req.body;
  try {
    const room = await roomService.getById(id);
    if (!room) {
      return res.status(404).json({ error: `Room with id ${id} not found.` });
    }
    if (room.creatorId !== req.userId) {
      return res.status(403).json({ error: 'Only the room creator can modify this room' });
    }
    const updatedRoom = await roomService.update(id, updateFields);
    const { hashedPassword, targetWord, ...publicData } = updatedRoom;
    res.json(publicData);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

const deleteRoom = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Id is required' });
  }
  try {
    const room = await roomService.getById(id);
    if (!room) {
      return res.status(404).json({ error: `Room with id ${id} not found.` });
    }
    if (room.creatorId !== req.userId) {
      return res.status(403).json({ error: 'Only the room creator can delete this room' });
    }
    const { deletedCount } = await roomService.deleteIt(id);
    res.json({ deletedCount });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

const verifyPassword = async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'Room id is required' });
  }
  
  try {
    const isValid = await roomService.verifyRoomPassword(id, password);
    res.json({ valid: isValid });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

const submitGuess = async (req, res) => {
  const { id } = req.params;
  const { guess } = req.body;
  
  if (!id) {
    return res.status(400).json({ error: 'Room id is required' });
  }
  
  if (!guess || guess.length !== 5) {
    return res.status(400).json({ error: 'Guess must be 5 letters' });
  }
  
  try {
    const room = await roomService.getById(id);
    if (!room) {
      return res.status(404).json({ error: `Room with id ${id} not found.` });
    }
    
    const result = gameService.checkGuess(guess, room.targetWord);
    const won = guess.toUpperCase() === room.targetWord.toUpperCase();
    
    res.json({
      result,
      won
    });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const roomControllers = {
  getRooms,
  getRoom,
  addRoom,
  modifyRoom,
  deleteRoom,
  verifyPassword,
  submitGuess
}
