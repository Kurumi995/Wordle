import { userService } from '../userService.js';
import { db } from '../../db/db.js';
import { User } from '../../models/user.js';
import bcrypt from 'bcrypt';
import sinon from 'sinon';

describe('User Service', () => {
  let getAllStub;
  let getByIdStub;
  let getByFieldStub;
  let addStub;
  let updateStub;
  let deleteStub;
  let fromUserDocumentStub;
  let bcryptHashStub;

  beforeEach(() => {
    getAllStub = sinon.stub(db, 'getAllInCollection');
    getByIdStub = sinon.stub(db, 'getFromCollectionById');
    getByFieldStub = sinon.stub(db, 'getFromCollectionByFieldValue');
    addStub = sinon.stub(db, 'addToCollection');
    updateStub = sinon.stub(db, 'updateCollectionById');
    deleteStub = sinon.stub(db, 'deleteFromCollectionById');
    fromUserDocumentStub = sinon.stub(User, 'fromUserDocument');
    bcryptHashStub = sinon.stub(bcrypt, 'hash');
  });

  afterEach(() => {
    getAllStub.restore();
    getByIdStub.restore();
    getByFieldStub.restore();
    addStub.restore();
    updateStub.restore();
    deleteStub.restore();
    fromUserDocumentStub.restore();
    bcryptHashStub.restore();
  });

  describe('getAll', () => {
    it('should map documents to User objects', async () => {
      getAllStub.resolves([{ _id: '1' }, { _id: '2' }]);
      fromUserDocumentStub.onCall(0).returns({ id: '1' });
      fromUserDocumentStub.onCall(1).returns({ id: '2' });

      const users = await userService.getAll();

      expect(getAllStub.calledOnceWith(db.USERS)).toBe(true);
      expect(users).toEqual([{ id: '1' }, { id: '2' }]);
    });
  });

  describe('getById', () => {
    it('should throw if id is missing', async () => {
      await expect(() => userService.getById(null)).rejects.toThrow('Null or undefined ID not allowed.');
    });

    it('should return mapped user', async () => {
      getByIdStub.resolves({ _id: '1' });
      fromUserDocumentStub.returns({ id: '1' });
      const user = await userService.getById('1');
      expect(user).toEqual({ id: '1' });
    });
  });

  describe('getByUsername', () => {
    it('should return mapped user', async () => {
      getByFieldStub.resolves({ _id: '1', username: 'alice' });
      fromUserDocumentStub.returns({ id: '1', username: 'alice' });
      const user = await userService.getByUsername('alice');
      expect(getByFieldStub.calledOnceWith(db.USERS, 'username', 'alice')).toBe(true);
      expect(user).toEqual({ id: '1', username: 'alice' });
    });
  });

  describe('add', () => {
    it('should throw if username or password missing', async () => {
      await expect(() => userService.add({ username: 'a' })).rejects.toThrow('Username and password cannot be empty.');
      await expect(() => userService.add({ password: 'p' })).rejects.toThrow('Username and password cannot be empty.');
    });

    it('should throw if username already exists', async () => {
      getByFieldStub.resolves({ _id: '1', username: 'alice' });
      await expect(() => userService.add({ username: 'alice', password: 'pw' })).rejects.toThrow('Username already exists.');
    });

    it('should hash password and insert user', async () => {
      getByFieldStub.resolves(null);
      bcryptHashStub.resolves('hash');
      addStub.resolves({ insertedId: { toString: () => 'newId' } });

      const result = await userService.add({ username: 'alice', password: 'pw' });

      expect(addStub.calledOnce).toBe(true);
      const inserted = addStub.firstCall.args[1];
      expect(inserted.username).toBe('alice');
      expect(inserted.hashedPassword).toBe('hash');
      expect(result).toEqual({ id: 'newId', username: 'alice', experience: 0 });
    });
  });

  describe('update', () => {
    it('should throw if id missing', async () => {
      await expect(() => userService.update(null, {})).rejects.toThrow('Null or undefined ID not allowed.');
    });

    it('should throw if new username exists on different user', async () => {
      getByFieldStub.resolves({ _id: { toString: () => 'other' }, username: 'bob' });
      await expect(() => userService.update('u1', { username: 'bob' })).rejects.toThrow('Username already exists.');
    });

    it('should hash password and remove password field before update', async () => {
      getByFieldStub.resolves(null);
      bcryptHashStub.resolves('hash2');
      updateStub.resolves({ modifiedCount: 1 });
      getByIdStub.resolves({ _id: 'u1' });
      fromUserDocumentStub.returns({ id: 'u1', username: 'alice' });

      const updated = await userService.update('u1', { password: 'pw2' });

      const updateFields = updateStub.firstCall.args[2];
      expect(updateFields.password).toBeUndefined();
      expect(updateFields.hashedPassword).toBe('hash2');
      expect(updated).toEqual({ id: 'u1', username: 'alice' });
    });

    it('should throw when modifiedCount is 0', async () => {
      getByFieldStub.resolves(null);
      updateStub.resolves({ modifiedCount: 0 });
      await expect(() => userService.update('u1', { experience: 2 })).rejects.toThrow("Can't update user. User with id u1 not found.");
    });
  });

  describe('deleteIt', () => {
    it('should throw if id missing', async () => {
      await expect(() => userService.deleteIt(null)).rejects.toThrow('Null or undefined ID not allowed.');
    });

    it('should throw when deletedCount is 0', async () => {
      deleteStub.resolves({ deletedCount: 0 });
      await expect(() => userService.deleteIt('u1')).rejects.toThrow("Can't delete user. User with id u1 not found.");
    });

    it('should return deletedCount on success', async () => {
      deleteStub.resolves({ deletedCount: 1 });
      const result = await userService.deleteIt('u1');
      expect(result).toEqual({ deletedCount: 1 });
    });
  });
});


