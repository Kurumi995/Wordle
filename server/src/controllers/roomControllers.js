import { roomService } from '../services/roomService.js';

const getRooms = async (req, res) => {
  try {
    const allRooms = await roomService.getAll();
    res.json(allRooms);
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
    res.json(theRoom);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

const addRoom = async (req, res) => {
  const roomData = req.body;
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
    const updatedRoom = await roomService.update(id, updateFields);
    if (!updatedRoom) {
      return res.status(404).json({ error: `Room with id ${id} not found.` });
    }
    res.json(updatedRoom);
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
    const { deletedCount } = await roomService.deleteIt(id);
    if (deletedCount === 0) {
      return res.status(404).json({ error: `Room with id ${id} not found.` });
    }
    res.json({ deletedCount });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const roomControllers = {
  getRooms,
  getRoom,
  addRoom,
  modifyRoom,
  deleteRoom
}

