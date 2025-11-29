import { db } from '../db/db.js';
import { User } from '../models/user.js';
import bcrypt from 'bcrypt';

const saltRounds = 10;

const getAll = async () => {
  const userDocs = await db.getAllInCollection(db.USERS);
  return userDocs.map(uDoc => User.fromUserDocument(uDoc));
}

const getById = async (id) => {
  if (!id) throw new Error('Null or undefined ID not allowed.');
  const userDoc = await db.getFromCollectionById(db.USERS, id);
  return User.fromUserDocument(userDoc);
}

const getByUsername = async (username) => {
  const userDoc = await db.getFromCollectionByFieldValue(db.USERS, 'username', username);
  return User.fromUserDocument(userDoc);
}

const add = async (userInfo) => {
  if (!userInfo.username || !userInfo.password) {
    throw new Error('Username and password cannot be empty.');
  }

  const existingUser = await db.getFromCollectionByFieldValue(db.USERS, 'username', userInfo.username);
  if (existingUser) {
    throw new Error('Username already exists.');
  }

  const hashedPassword = await bcrypt.hash(userInfo.password, saltRounds);

  const userData = {
    username: userInfo.username,
    hashedPassword: hashedPassword,
    experience: userInfo.experience ?? 0 
  };

  const {insertedId} = await db.addToCollection(db.USERS, userData);
  return {
    id: insertedId.toString(),
    username: userData.username,
    experience: userData.experience
  }
}

const update = async (id, updateFields) => {
  if (!id) throw new Error('Null or undefined ID not allowed.');
  
  if (updateFields.username) {
    const existingUser = await db.getFromCollectionByFieldValue(db.USERS, 'username', updateFields.username);
    if (existingUser && existingUser._id.toString() !== id) {
      throw new Error('Username already exists.');
    }
  }

  if (updateFields.password) {
    updateFields.hashedPassword = await bcrypt.hash(updateFields.password, saltRounds);
    delete updateFields.password;
  }

  const { modifiedCount } = await db.updateCollectionById(db.USERS, id, updateFields);
  if (modifiedCount === 0) {
    throw new Error(`Can't update user. User with id ${id} not found.`);
  }
  const updatedUser = await getById(id);
  return updatedUser;
}

const deleteIt = async (id) => {
  if (!id) throw new Error('Null or undefined ID not allowed.');
  
  const { deletedCount } = await db.deleteFromCollectionById(db.USERS, id);
  if (deletedCount === 0) {
    throw new Error(`Can't delete user. User with id ${id} not found.`);
  }
  return { deletedCount };
}

export const userService = {
  getAll, 
  getById,
  getByUsername,
  add,
  update,
  deleteIt
}

