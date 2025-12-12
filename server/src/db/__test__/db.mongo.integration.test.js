import { MongoMemoryServer } from 'mongodb-memory-server';
import { ObjectId } from 'mongodb';
import { db } from '../db.js';

describe('db module (mongo integration)', () => {
  let mongoMemoryServer;

  beforeAll(async () => {
    mongoMemoryServer = await MongoMemoryServer.create();
    process.env.MONGO_URI = mongoMemoryServer.getUri();
    process.env.DB_NAME = 'wordle_test';
    await db.init();
  });

  afterAll(async () => {
    await db.close();
    await mongoMemoryServer.stop();
    delete process.env.MONGO_URI;
    delete process.env.DB_NAME;
  });

  it('getAllInCollection should return empty array for new collection', async () => {
    const result = await db.getAllInCollection('testCollection');
    expect(result).toEqual([]);
  });

  it('getFromCollectionById should return null for missing id', async () => {
    const id = new ObjectId().toString();
    const result = await db.getFromCollectionById('testCollection', id);
    expect(result).toBe(null);
  });

  it('addToCollection and deleteFromCollectionById should work', async () => {
    const { insertedId } = await db.addToCollection('testCollection', { a: 1 });
    expect(insertedId).toBeTruthy();
    const deleted = await db.deleteFromCollectionById('testCollection', insertedId.toString());
    expect(deleted.deletedCount).toBe(1);
  });

  it('updateCollectionById should update a document', async () => {
    const { insertedId } = await db.addToCollection('testCollection', { a: 1, b: 1 });
    const updateResult = await db.updateCollectionById('testCollection', insertedId.toString(), { b: 2 });
    expect(updateResult.modifiedCount).toBe(1);

    const doc = await db.getFromCollectionById('testCollection', insertedId.toString());
    expect(doc.a).toBe(1);
    expect(doc.b).toBe(2);
  });

  it('getFromCollectionByFieldValue should return matching document', async () => {
    await db.addToCollection('testCollection', { key: 'k1', value: 123 });
    const doc = await db.getFromCollectionByFieldValue('testCollection', 'key', 'k1');
    expect(doc).toBeTruthy();
    expect(doc.key).toBe('k1');
    expect(doc.value).toBe(123);
  });
});


