import { authControllers } from '../authControllers.js';
import { authService } from '../../services/authService.js';
import sinon from 'sinon';

describe('Auth Controllers', () => {
  let registerUserStub;
  let validateLoginStub;

  beforeEach(() => {
    registerUserStub = sinon.stub(authService, 'registerUser');
    validateLoginStub = sinon.stub(authService, 'validateLogin');
  });

  afterEach(() => {
    registerUserStub.restore();
    validateLoginStub.restore();
  });

  describe('register', () => {
    it('should return 200 on successful registration', async () => {
      const req = { body: { username: 'alice', password: 'pw' } };
      const resSendStatusStub = sinon.stub();
      const res = { sendStatus: resSendStatusStub };
      registerUserStub.resolves();

      await authControllers.register(req, res);

      expect(registerUserStub.calledOnceWith('alice', 'pw')).toBe(true);
      expect(resSendStatusStub.calledOnceWith(200)).toBe(true);
    });

    it('should return 500 on registration error', async () => {
      const req = { body: { username: 'alice', password: 'pw' } };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };
      registerUserStub.rejects(new Error('boom'));

      await authControllers.register(req, res);

      expect(resStatusStub.calledOnceWith(500)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'boom' })).toBe(true);
    });
  });

  describe('login', () => {
    it('should return 200 with user on successful login', async () => {
      const req = { body: { username: 'alice', password: 'pw' } };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };
      const user = { id: 'u1', username: 'alice', jwt: 't' };
      validateLoginStub.resolves(user);

      await authControllers.login(req, res);

      expect(validateLoginStub.calledOnceWith('alice', 'pw')).toBe(true);
      expect(resStatusStub.calledOnceWith(200)).toBe(true);
      expect(resJsonStub.calledOnceWith(user)).toBe(true);
    });

    it('should return 401 on login error', async () => {
      const req = { body: { username: 'alice', password: 'bad' } };
      const resJsonStub = sinon.stub();
      const resStatusStub = sinon.stub().returns({ json: resJsonStub });
      const res = { status: resStatusStub };
      validateLoginStub.rejects(new Error('Invalid password'));

      await authControllers.login(req, res);

      expect(resStatusStub.calledOnceWith(401)).toBe(true);
      expect(resJsonStub.calledOnceWith({ error: 'Invalid password' })).toBe(true);
    });
  });
});


