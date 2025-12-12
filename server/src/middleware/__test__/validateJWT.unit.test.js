import { validateJWT } from '../validateJWT.js';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import sinon from 'sinon';

describe('validateJWT middleware', () => {
  let jwtVerifyStub;
  let fsReadStub;

  beforeEach(() => {
    jwtVerifyStub = sinon.stub(jwt, 'verify');
    fsReadStub = sinon.stub(fs, 'readFileSync');
    process.env.JWT_PRIVATE_KEY = 'priv';
    process.env.JWT_PUBLIC_KEY = 'pub';
    delete process.env.JWT_PRIVATE_KEY_PATH;
    delete process.env.JWT_PUBLIC_KEY_PATH;
  });

  afterEach(() => {
    jwtVerifyStub.restore();
    fsReadStub.restore();
    delete process.env.JWT_PRIVATE_KEY;
    delete process.env.JWT_PUBLIC_KEY;
    delete process.env.JWT_PRIVATE_KEY_PATH;
    delete process.env.JWT_PUBLIC_KEY_PATH;
  });

  it('should return 401 when token is missing', () => {
    const req = { headers: {} };
    const resSendStatusStub = sinon.stub();
    const res = { sendStatus: resSendStatusStub };
    const next = sinon.stub();

    validateJWT(req, res, next);

    expect(resSendStatusStub.calledOnceWith(401)).toBe(true);
    expect(next.called).toBe(false);
  });

  it('should set req.userId and call next for valid token payload', () => {
    const req = { headers: { authorization: 'Bearer token123' } };
    const resSendStatusStub = sinon.stub();
    const res = { sendStatus: resSendStatusStub };
    const next = sinon.stub();

    jwtVerifyStub.returns({ userId: 'u1' });

    validateJWT(req, res, next);

    expect(req.userId).toBe('u1');
    expect(next.calledOnce).toBe(true);
  });

  it('should return 401 when payload has no userId', () => {
    const req = { headers: { authorization: 'Bearer token123' } };
    const resSendStatusStub = sinon.stub();
    const res = { sendStatus: resSendStatusStub };
    const next = sinon.stub();

    jwtVerifyStub.returns({ nope: true });

    validateJWT(req, res, next);

    expect(resSendStatusStub.calledOnceWith(401)).toBe(true);
    expect(next.called).toBe(false);
  });

  it('should return 403 when jwt.verify throws', () => {
    const req = { headers: { authorization: 'Bearer badtoken' } };
    const resSendStatusStub = sinon.stub();
    const res = { sendStatus: resSendStatusStub };
    const next = sinon.stub();

    jwtVerifyStub.throws(new Error('bad token'));

    validateJWT(req, res, next);

    expect(resSendStatusStub.calledOnceWith(403)).toBe(true);
    expect(next.called).toBe(false);
  });

  it('should load keys from files when env paths are provided', () => {
    process.env.JWT_PRIVATE_KEY_PATH = 'privPath';
    process.env.JWT_PUBLIC_KEY_PATH = 'pubPath';
    fsReadStub.withArgs('privPath', 'utf8').returns('privFromFile');
    fsReadStub.withArgs('pubPath', 'utf8').returns('pubFromFile');

    const req = { headers: { authorization: 'Bearer token123' } };
    const resSendStatusStub = sinon.stub();
    const res = { sendStatus: resSendStatusStub };
    const next = sinon.stub();

    jwtVerifyStub.returns({ userId: 'u1' });

    validateJWT(req, res, next);

    expect(fsReadStub.called).toBe(true);
    expect(jwtVerifyStub.calledOnce).toBe(true);
    expect(next.calledOnce).toBe(true);
  });
});


