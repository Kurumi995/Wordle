import { userService } from '../services/userService.js';

const getUsers = async (req, res) => {
  try {
    const allUsers = await userService.getAll();
    res.json(allUsers);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

const getUser = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Id is required' });
  }
  try {
    const theUser = await userService.getById(id);
    if (!theUser) {
      return res.status(404).json({ error: `User with id ${id} not found.` });
    }
    res.json(theUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

const addUser = async (req, res) => {
  const userData = req.body;
  try {
    const result = await userService.add(userData);
    res.status(201).json(result);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
}

const modifyUser = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Id is required' });
  }
  const updateFields = req.body;
  try {
    const updatedUser = await userService.update(id, updateFields);
    if (!updatedUser) {
      return res.status(404).json({ error: `User with id ${id} not found.` });
    }
    res.json(updatedUser);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

const deleteUser = async (req, res) => {
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ error: 'Id is required' });
  }
  try {
    const { deletedCount } = await userService.deleteIt(id);
    if (deletedCount === 0) {
      return res.status(404).json({ error: `User with id ${id} not found.` });
    }
    res.json({ deletedCount });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

export const userControllers = {
  getUsers,
  getUser,
  addUser,
  modifyUser,
  deleteUser
}

