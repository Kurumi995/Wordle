import { roomControllers } from '../roomControllers.js';
import { roomService } from '../../services/roomService.js';
import { gameService } from '../../services/gameService.js';
import sinon from 'sinon';

describe('Room Controllers', () => {
  let getAllStub;
  let getByIdStub;
  let addStub;
  let updateStub;
  let deleteStub;
  let verifyPasswordStub;
  let checkGuessStub;

  beforeEach(() => {
    getAllStub = sinon.stub(roomService, 'getAll');
    getByIdStub = sinon.stub(roomService, 'getById');
    addStub = sinon.stub(roomService, 'add');
    updateStub = sinon.stub(roomService, 'update');
    deleteStub = sinon.stub(roomService, 'deleteIt');
    verifyPasswordStub = sinon.stub(roomService, 'verifyRoomPassword');
    checkGuessStub = sinon.stub(gameService, 'checkGuess');
  });

  afterEach(() => {
    getAllStub.restore();
    getByIdStub.restore();
    addStub.restore();
    updateStub.restore();
    deleteStub.restore();
    verifyPasswordStub.restore();
    checkGuessStub.restore();
  });

  describe('getRooms', () => {
    it('should return rooms with sensitive fields removed', async () => {
      const req = {};
      const resJsonStub = sinon.stub();
      const res = { json: resJsonStub };
      getAllStub.resolves([{ id: 'r1', hashedPassword: 'h', targetWord: 'APPLE', creatorId: 'u1', isPublic: true }]);

      await roomControllers.getRooms(req, res);

      expect(resJsonStub.calledOnce).toBe(true);
      expect(resJsonStub.firstCall.args[0]).toEqual([{ id: 'r1', creatorId: 'u1', isPublic: true }]);
    });
  });

  describe('getRoom', () => {
    it('should return 400 when id missing', async () => {
      const req = { params: {} };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };

      await roomControllers.getRoom(req, res);

      expect(resStatusStub.calledOnceWith(400)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'Id is required' })).toBe(true);
    });

    it('should return 404 when room not found', async () => {
      const req = { params: { id: 'r1' } };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };
      getByIdStub.resolves(null);

      await roomControllers.getRoom(req, res);

      expect(resStatusStub.calledOnceWith(404)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'Room with id r1 not found.' })).toBe(true);
    });

    it('should return public room data when found', async () => {
      const req = { params: { id: 'r1' } };
      const resJsonStub = sinon.stub();
      const res = { json: resJsonStub };
      getByIdStub.resolves({ id: 'r1', hashedPassword: 'h', targetWord: 'APPLE', creatorId: 'u1', isPublic: true });

      await roomControllers.getRoom(req, res);

      expect(resJsonStub.calledOnceWith({ id: 'r1', creatorId: 'u1', isPublic: true })).toBe(true);
    });
  });

  describe('addRoom', () => {
    it('should attach creatorId from req.userId and return 201', async () => {
      const req = { body: { isPublic: true }, userId: 'u1' };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };
      addStub.resolves({ id: 'r1', isPublic: true, creatorId: 'u1', targetWord: 'APPLE' });

      await roomControllers.addRoom(req, res);

      expect(addStub.calledOnceWith({ isPublic: true, creatorId: 'u1' })).toBe(true);
      expect(resStatusStub.calledOnceWith(201)).toBe(true);
    });
  });

  describe('modifyRoom', () => {
    it('should return 403 when user is not creator', async () => {
      const req = { params: { id: 'r1' }, body: {}, userId: 'u2' };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };
      getByIdStub.resolves({ id: 'r1', creatorId: 'u1' });

      await roomControllers.modifyRoom(req, res);

      expect(resStatusStub.calledOnceWith(403)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'Only the room creator can modify this room' })).toBe(true);
    });

    it('should return updated public room data', async () => {
      const req = { params: { id: 'r1' }, body: { isPublic: true }, userId: 'u1' };
      const resJsonStub = sinon.stub();
      const res = { json: resJsonStub };
      getByIdStub.resolves({ id: 'r1', creatorId: 'u1' });
      updateStub.resolves({ id: 'r1', creatorId: 'u1', hashedPassword: 'h', targetWord: 'APPLE', isPublic: true });

      await roomControllers.modifyRoom(req, res);

      expect(resJsonStub.calledOnceWith({ id: 'r1', creatorId: 'u1', isPublic: true })).toBe(true);
    });
  });

  describe('deleteRoom', () => {
    it('should return 403 when user is not creator', async () => {
      const req = { params: { id: 'r1' }, userId: 'u2' };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };
      getByIdStub.resolves({ id: 'r1', creatorId: 'u1' });

      await roomControllers.deleteRoom(req, res);

      expect(resStatusStub.calledOnceWith(403)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'Only the room creator can delete this room' })).toBe(true);
    });

    it('should return deletedCount', async () => {
      const req = { params: { id: 'r1' }, userId: 'u1' };
      const resJsonStub = sinon.stub();
      const res = { json: resJsonStub };
      getByIdStub.resolves({ id: 'r1', creatorId: 'u1' });
      deleteStub.resolves({ deletedCount: 1 });

      await roomControllers.deleteRoom(req, res);

      expect(resJsonStub.calledOnceWith({ deletedCount: 1 })).toBe(true);
    });
  });

  describe('verifyPassword', () => {
    it('should return valid boolean', async () => {
      const req = { params: { id: 'r1' }, body: { password: 'pw' } };
      const resJsonStub = sinon.stub();
      const res = { json: resJsonStub };
      verifyPasswordStub.resolves(true);

      await roomControllers.verifyPassword(req, res);

      expect(verifyPasswordStub.calledOnceWith('r1', 'pw')).toBe(true);
      expect(resJsonStub.calledOnceWith({ valid: true })).toBe(true);
    });
  });

  describe('submitGuess', () => {
    it('should return 400 when guess invalid', async () => {
      const req = { params: { id: 'r1' }, body: { guess: 'NO' } };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };

      await roomControllers.submitGuess(req, res);

      expect(resStatusStub.calledOnceWith(400)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'Guess must be 5 letters' })).toBe(true);
    });

    it('should return guess result and won', async () => {
      const req = { params: { id: 'r1' }, body: { guess: 'APPLE' } };
      const resJsonStub = sinon.stub();
      const res = { json: resJsonStub };
      getByIdStub.resolves({ id: 'r1', targetWord: 'APPLE' });
      checkGuessStub.returns({ result: [{ letter: 'A', status: 'correct' }], won: true });

      await roomControllers.submitGuess(req, res);

      expect(resJsonStub.calledOnceWith({ result: [{ letter: 'A', status: 'correct' }], won: true })).toBe(true);
    });
  });
});


