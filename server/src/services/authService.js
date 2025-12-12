import bcrypt from 'bcrypt';
import { db } from '../db/db.js';
import { User } from '../models/user.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';

const SALT_ROUNDS = 10;

let jwtPrivateKey;
let jwtPublicKey;

const registerUser = async (username, password) => {
  const user = await db.getFromCollectionByFieldValue(db.USERS, 'username', username);
  if (user) {
    throw new Error('Username already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const result = await db.addToCollection(db.USERS, {
    username, 
    hashedPassword,
    experience: 0
  });
  if (!result.acknowledged || !result.insertedId) {
    throw new Error('Error adding user to database');
  }
  return; 
}

const loadKeys = () => {
  const privPath = process.env.JWT_PRIVATE_KEY_PATH;
  const pubPath  = process.env.JWT_PUBLIC_KEY_PATH;

  jwtPrivateKey = privPath ? fs.readFileSync(privPath, 'utf8') : process.env.JWT_PRIVATE_KEY;
  jwtPublicKey  = pubPath  ? fs.readFileSync(pubPath, 'utf8')  : process.env.JWT_PUBLIC_KEY;
}

const generateToken = (userId) => {
  loadKeys();
  let data = {
    time: Date(),
    userId
  }
  return jwt.sign(data, jwtPrivateKey, { algorithm: 'RS256', expiresIn: '1h' });
}

const validateLogin = async (username, password) => {
  const userDoc = await db.getFromCollectionByFieldValue(db.USERS, 'username', username);
  if (!userDoc) {
    throw new Error('Username not found.');
  }
  const user = User.fromUserDocument(userDoc);  
  const result = await bcrypt.compare(password, user.hashedPassword);
  if (result) {
    const token = generateToken(user.id);
    user.jwt = token;
    delete user.hashedPassword;
    return user;
  } else {
    throw new Error('Invalid password');
  }
}

export const authService = {
  registerUser, 
  validateLogin
}