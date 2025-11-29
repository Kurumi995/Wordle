import { MongoClient, ObjectId } from "mongodb";

let mongoClient = null;
let theDb = null;

const USERS = 'users';
const ROOMS = 'rooms';

const init = async () => {
  const mongoURI = process.env.MONGO_URI;
  const dbName = process.env.DB_NAME;
  mongoClient = new MongoClient(mongoURI);
  await mongoClient.connect();
  theDb = mongoClient.db(dbName);
  console.log(`Connected to MongoDB database: ${dbName}`);
}

const close = async () => {
  await mongoClient.close();
}

const getAllInCollection = async (collectionName) => {
  if (!mongoClient) { await init(); }
  const allDocs = await theDb.collection(collectionName).find();
  return allDocs.toArray();
}

const getFromCollectionById = async (collectionName, id) => {
  if (!mongoClient) { await init(); }
  const doc = await theDb.collection(collectionName).findOne({_id: new ObjectId(String(id))});
  return doc;
}

const deleteFromCollectionById = async (collectionName, id) => {
  if (!mongoClient) { await init(); }
  const result = await theDb.collection(collectionName).deleteOne({_id: new ObjectId(String(id))});
  return result;
}

const addToCollection = async (collectionName, docData) => {
  if (!mongoClient) { await init(); }
  const result = await theDb.collection(collectionName).insertOne(docData);
  return result;
}

const updateCollectionById = async (collectionName, id, updateData) => {
  if (!mongoClient) { await init(); }
  const result = await theDb.collection(collectionName).updateOne(
    {_id: new ObjectId(String(id))},
    {$set: updateData}
  );
  return result;
}

const getFromCollectionByFieldValue = async (collectionName, fieldName, fieldValue) => {
  if (!mongoClient) { await init(); }
  const doc = await theDb
    .collection(collectionName)
    .findOne({[fieldName]: fieldValue});
  return doc;
}

export const db = {
  init, 
  close,
  getAllInCollection, 
  getFromCollectionById,
  addToCollection,
  deleteFromCollectionById,
  updateCollectionById,
  getFromCollectionByFieldValue,
  USERS,
  ROOMS
}

