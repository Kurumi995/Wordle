import { userControllers } from '../userControllers.js';
import { userService } from '../../services/userService.js';
import sinon from 'sinon';

describe('User Controllers', () => {
  let getAllStub;
  let getByIdStub;
  let addStub;
  let updateStub;
  let deleteStub;

  beforeEach(() => {
    getAllStub = sinon.stub(userService, 'getAll');
    getByIdStub = sinon.stub(userService, 'getById');
    addStub = sinon.stub(userService, 'add');
    updateStub = sinon.stub(userService, 'update');
    deleteStub = sinon.stub(userService, 'deleteIt');
  });

  afterEach(() => {
    getAllStub.restore();
    getByIdStub.restore();
    addStub.restore();
    updateStub.restore();
    deleteStub.restore();
  });

  describe('getUsers', () => {
    it('should return users', async () => {
      const req = {};
      const resJsonStub = sinon.stub();
      const res = { json: resJsonStub };
      getAllStub.resolves([{ id: 'u1' }]);

      await userControllers.getUsers(req, res);

      expect(resJsonStub.calledOnceWith([{ id: 'u1' }])).toBe(true);
    });

    it('should return 500 on error', async () => {
      const req = {};
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };
      getAllStub.rejects(new Error('boom'));

      await userControllers.getUsers(req, res);

      expect(resStatusStub.calledOnceWith(500)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'boom' })).toBe(true);
    });
  });

  describe('getUser', () => {
    it('should return 400 when id missing', async () => {
      const req = { params: {} };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };

      await userControllers.getUser(req, res);

      expect(resStatusStub.calledOnceWith(400)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'Id is required' })).toBe(true);
    });

    it('should return 404 when user not found', async () => {
      const req = { params: { id: 'u1' } };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };
      getByIdStub.resolves(null);

      await userControllers.getUser(req, res);

      expect(resStatusStub.calledOnceWith(404)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'User with id u1 not found.' })).toBe(true);
    });

    it('should return user when found', async () => {
      const req = { params: { id: 'u1' } };
      const resJsonStub = sinon.stub();
      const res = { json: resJsonStub };
      getByIdStub.resolves({ id: 'u1' });

      await userControllers.getUser(req, res);

      expect(resJsonStub.calledOnceWith({ id: 'u1' })).toBe(true);
    });
  });

  describe('addUser', () => {
    it('should return 201 with created user', async () => {
      const req = { body: { username: 'alice', password: 'pw' } };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };
      addStub.resolves({ id: 'u1', username: 'alice' });

      await userControllers.addUser(req, res);

      expect(resStatusStub.calledOnceWith(201)).toBe(true);
      expect(resJsonStub.calledOnceWith({ id: 'u1', username: 'alice' })).toBe(true);
    });

    it('should return 400 on service error', async () => {
      const req = { body: {} };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };
      addStub.rejects(new Error('bad'));

      await userControllers.addUser(req, res);

      expect(resStatusStub.calledOnceWith(400)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'bad' })).toBe(true);
    });
  });

  describe('modifyUser', () => {
    it('should return 400 when id missing', async () => {
      const req = { params: {}, body: {}, userId: 'u1' };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };

      await userControllers.modifyUser(req, res);

      expect(resStatusStub.calledOnceWith(400)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'Id is required' })).toBe(true);
    });

    it('should return 403 when modifying other user', async () => {
      const req = { params: { id: 'u2' }, body: {}, userId: 'u1' };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };

      await userControllers.modifyUser(req, res);

      expect(resStatusStub.calledOnceWith(403)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'You can only modify your own profile' })).toBe(true);
    });

    it('should return updated user', async () => {
      const req = { params: { id: 'u1' }, body: { experience: 2 }, userId: 'u1' };
      const resJsonStub = sinon.stub();
      const res = { json: resJsonStub };
      updateStub.resolves({ id: 'u1', experience: 2 });

      await userControllers.modifyUser(req, res);

      expect(updateStub.calledOnceWith('u1', { experience: 2 })).toBe(true);
      expect(resJsonStub.calledOnceWith({ id: 'u1', experience: 2 })).toBe(true);
    });
  });

  describe('deleteUser', () => {
    it('should return 400 when id missing', async () => {
      const req = { params: {}, userId: 'u1' };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };

      await userControllers.deleteUser(req, res);

      expect(resStatusStub.calledOnceWith(400)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'Id is required' })).toBe(true);
    });

    it('should return 403 when deleting other user', async () => {
      const req = { params: { id: 'u2' }, userId: 'u1' };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };

      await userControllers.deleteUser(req, res);

      expect(resStatusStub.calledOnceWith(403)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'You can only delete your own profile' })).toBe(true);
    });

    it('should return deletedCount', async () => {
      const req = { params: { id: 'u1' }, userId: 'u1' };
      const resJsonStub = sinon.stub();
      const res = { json: resJsonStub };
      deleteStub.resolves({ deletedCount: 1 });

      await userControllers.deleteUser(req, res);

      expect(resJsonStub.calledOnceWith({ deletedCount: 1 })).toBe(true);
    });
  });
});


