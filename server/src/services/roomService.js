import { db } from '../db/db.js';
import { Room } from '../models/room.js';
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

const getRandomWord = async () => {
  try {
    const response = await fetch('https://random-word-api.vercel.app/api?words=1&length=5');
    const data = await response.json();
    return data[0].toUpperCase();
  } catch (error) {
    const fallbackWords = ['APPLE', 'BEACH', 'CHAIR', 'DANCE', 'EARTH', 'FLAME'];
    return fallbackWords[Math.floor(Math.random() * fallbackWords.length)];
  }
};

const getAll = async () => {
  const roomDocs = await db.getAllInCollection(db.ROOMS);
  return roomDocs.map(rDoc => Room.fromRoomDocument(rDoc));
}

const getById = async (id) => {
  if (!id) throw new Error('Null or undefined ID not allowed.');
  const roomDoc = await db.getFromCollectionById(db.ROOMS, id);
  return Room.fromRoomDocument(roomDoc);
}

const add = async (roomInfo) => {
  if (!roomInfo.creatorId) {
    throw new Error('Creator ID is required.');
  }

  if (roomInfo.isPublic === false && !roomInfo.password) {
    throw new Error('Private rooms require a password.');
  }

  const targetWord = await getRandomWord();

  let hashedPassword = '';
  if (roomInfo.password) {
    hashedPassword = await bcrypt.hash(roomInfo.password, SALT_ROUNDS);
  }

  const roomData = {
    isPublic: roomInfo.isPublic ?? true,
    hashedPassword: hashedPassword,
    creatorId: roomInfo.creatorId,
    targetWord: targetWord
  };

  const {insertedId} = await db.addToCollection(db.ROOMS, roomData);
  return {
    id: insertedId.toString(),
    isPublic: roomData.isPublic,
    creatorId: roomData.creatorId,
    targetWord: roomData.targetWord
  }
}

const update = async (id, updateFields) => {
  if (!id) throw new Error('Null or undefined ID not allowed.');

  if (updateFields.password) {
    updateFields.hashedPassword = await bcrypt.hash(updateFields.password, SALT_ROUNDS);
    delete updateFields.password;
  }

  if (updateFields.isPublic === true) {
    updateFields.hashedPassword = '';
  }

  if (updateFields.isPublic === false) {
    const existingRoom = await getById(id);
    if (!updateFields.hashedPassword && !existingRoom.hashedPassword) {
      throw new Error('Private rooms require a password.');
    }
  }

  const { modifiedCount } = await db.updateCollectionById(db.ROOMS, id, updateFields);
  if (modifiedCount === 0) {
    throw new Error(`Can't update room. Room with id ${id} not found.`);
  }
  const updatedRoom = await getById(id);
  return updatedRoom;
}

const deleteIt = async (id) => {
  if (!id) throw new Error('Null or undefined ID not allowed.');
  
  const { deletedCount } = await db.deleteFromCollectionById(db.ROOMS, id);
  if (deletedCount === 0) {
    throw new Error(`Can't delete room. Room with id ${id} not found.`);
  }
  return { deletedCount };
}

const verifyRoomPassword = async (roomId, password) => {
  const room = await getById(roomId);
  if (!room) {
    throw new Error('Room not found.');
  }
  if (room.isPublic) {
    return true;
  }
  if (!password) {
    return false;
  }
  const roomDoc = await db.getFromCollectionById(db.ROOMS, roomId);
  return await bcrypt.compare(password, roomDoc.hashedPassword);
}

export const roomService = {
  getAll, 
  getById,
  add,
  update,
  deleteIt,
  verifyRoomPassword
}

