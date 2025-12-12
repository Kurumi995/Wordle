import { roomService } from '../roomService.js';
import { db } from '../../db/db.js';
import { Room } from '../../models/room.js';
import bcrypt from 'bcrypt';
import sinon from 'sinon';

describe('Room Service', () => {
  let getAllStub;
  let getByIdStub;
  let addStub;
  let updateStub;
  let deleteStub;
  let fromRoomDocumentStub;
  let bcryptHashStub;
  let bcryptCompareStub;
  let originalFetch;

  beforeEach(() => {
    getAllStub = sinon.stub(db, 'getAllInCollection');
    getByIdStub = sinon.stub(db, 'getFromCollectionById');
    addStub = sinon.stub(db, 'addToCollection');
    updateStub = sinon.stub(db, 'updateCollectionById');
    deleteStub = sinon.stub(db, 'deleteFromCollectionById');
    fromRoomDocumentStub = sinon.stub(Room, 'fromRoomDocument');
    bcryptHashStub = sinon.stub(bcrypt, 'hash');
    bcryptCompareStub = sinon.stub(bcrypt, 'compare');
    originalFetch = global.fetch;
  });

  afterEach(() => {
    getAllStub.restore();
    getByIdStub.restore();
    addStub.restore();
    updateStub.restore();
    deleteStub.restore();
    fromRoomDocumentStub.restore();
    bcryptHashStub.restore();
    bcryptCompareStub.restore();
    global.fetch = originalFetch;
  });

  describe('getAll', () => {
    it('should map documents to Room objects', async () => {
      getAllStub.resolves([{ _id: '1' }, { _id: '2' }]);
      fromRoomDocumentStub.onCall(0).returns({ id: '1' });
      fromRoomDocumentStub.onCall(1).returns({ id: '2' });

      const rooms = await roomService.getAll();

      expect(getAllStub.calledOnceWith(db.ROOMS)).toBe(true);
      expect(rooms).toEqual([{ id: '1' }, { id: '2' }]);
    });
  });

  describe('getById', () => {
    it('should throw if id missing', async () => {
      await expect(() => roomService.getById(null)).rejects.toThrow('Null or undefined ID not allowed.');
    });

    it('should return mapped room', async () => {
      getByIdStub.resolves({ _id: 'r1' });
      fromRoomDocumentStub.returns({ id: 'r1' });
      const room = await roomService.getById('r1');
      expect(room).toEqual({ id: 'r1' });
    });
  });

  describe('add', () => {
    it('should throw if creatorId missing', async () => {
      await expect(() => roomService.add({ isPublic: true })).rejects.toThrow('Creator ID is required.');
    });

    it('should throw if private room missing password', async () => {
      await expect(() => roomService.add({ creatorId: 'u1', isPublic: false })).rejects.toThrow('Private rooms require a password.');
    });

    it('should fetch random word and return created room data', async () => {
      global.fetch = sinon.stub().resolves({
        json: async () => ['apple']
      });
      bcryptHashStub.resolves('hash');
      addStub.resolves({ insertedId: { toString: () => 'r1' } });

      const result = await roomService.add({ creatorId: 'u1', isPublic: false, password: 'pw' });

      expect(result).toEqual({ id: 'r1', isPublic: false, creatorId: 'u1', targetWord: 'APPLE' });
      const inserted = addStub.firstCall.args[1];
      expect(inserted.targetWord).toBe('APPLE');
      expect(inserted.hashedPassword).toBe('hash');
    });

    it('should fallback when random word fetch fails', async () => {
      global.fetch = sinon.stub().rejects(new Error('network'));
      addStub.resolves({ insertedId: { toString: () => 'r1' } });

      const result = await roomService.add({ creatorId: 'u1', isPublic: true });

      expect(result.id).toBe('r1');
      expect(result.targetWord.length).toBe(5);
    });
  });

  describe('update', () => {
    it('should throw if id missing', async () => {
      await expect(() => roomService.update(null, {})).rejects.toThrow('Null or undefined ID not allowed.');
    });

    it('should hash password and delete password field', async () => {
      bcryptHashStub.resolves('hash2');
      updateStub.resolves({ modifiedCount: 1 });
      getByIdStub.resolves({ _id: 'r1' });
      fromRoomDocumentStub.returns({ id: 'r1', hashedPassword: 'hash2' });

      await roomService.update('r1', { password: 'pw2' });

      const updateFields = updateStub.firstCall.args[2];
      expect(updateFields.password).toBeUndefined();
      expect(updateFields.hashedPassword).toBe('hash2');
    });

    it('should clear hashedPassword when setting isPublic to true', async () => {
      updateStub.resolves({ modifiedCount: 1 });
      getByIdStub.resolves({ _id: 'r1' });
      fromRoomDocumentStub.returns({ id: 'r1', hashedPassword: '' });

      await roomService.update('r1', { isPublic: true });

      const updateFields = updateStub.firstCall.args[2];
      expect(updateFields.hashedPassword).toBe('');
    });

    it('should throw when setting isPublic false without existing or provided password', async () => {
      updateStub.resolves({ modifiedCount: 1 });
      getByIdStub.resolves({ _id: 'r1', hashedPassword: '' });
      fromRoomDocumentStub.returns({ id: 'r1', hashedPassword: '' });

      await expect(() => roomService.update('r1', { isPublic: false })).rejects.toThrow('Private rooms require a password.');
    });

    it('should throw when modifiedCount is 0', async () => {
      updateStub.resolves({ modifiedCount: 0 });
      await expect(() => roomService.update('r1', { isPublic: true })).rejects.toThrow("Can't update room. Room with id r1 not found.");
    });
  });

  describe('deleteIt', () => {
    it('should throw if id missing', async () => {
      await expect(() => roomService.deleteIt(null)).rejects.toThrow('Null or undefined ID not allowed.');
    });

    it('should throw when deletedCount is 0', async () => {
      deleteStub.resolves({ deletedCount: 0 });
      await expect(() => roomService.deleteIt('r1')).rejects.toThrow("Can't delete room. Room with id r1 not found.");
    });

    it('should return deletedCount on success', async () => {
      deleteStub.resolves({ deletedCount: 1 });
      const result = await roomService.deleteIt('r1');
      expect(result).toEqual({ deletedCount: 1 });
    });
  });

  describe('verifyRoomPassword', () => {
    it('should return true for public room', async () => {
      getByIdStub.resolves({ _id: 'r1' });
      fromRoomDocumentStub.returns({ id: 'r1', isPublic: true });
      const result = await roomService.verifyRoomPassword('r1', null);
      expect(result).toBe(true);
    });

    it('should return false for private room without password', async () => {
      getByIdStub.resolves({ _id: 'r1' });
      fromRoomDocumentStub.returns({ id: 'r1', isPublic: false, hashedPassword: 'hash' });
      const result = await roomService.verifyRoomPassword('r1', null);
      expect(result).toBe(false);
    });

    it('should compare password for private room', async () => {
      getByIdStub.onCall(0).resolves({ _id: 'r1' });
      fromRoomDocumentStub.returns({ id: 'r1', isPublic: false, hashedPassword: 'hash' });
      getByIdStub.onCall(1).resolves({ _id: 'r1', hashedPassword: 'hash' });
      bcryptCompareStub.resolves(true);

      const result = await roomService.verifyRoomPassword('r1', 'pw');

      expect(result).toBe(true);
      expect(bcryptCompareStub.calledOnceWith('pw', 'hash')).toBe(true);
    });
  });
});


