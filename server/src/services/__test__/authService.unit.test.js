import { authService } from '../authService.js';
import { db } from '../../db/db.js';
import { User } from '../../models/user.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import sinon from 'sinon';

describe('Auth Service', () => {
  let getByFieldStub;
  let addToCollectionStub;
  let fromUserDocumentStub;
  let bcryptHashStub;
  let bcryptCompareStub;
  let jwtSignStub;
  let fsReadStub;

  beforeEach(() => {
    getByFieldStub = sinon.stub(db, 'getFromCollectionByFieldValue');
    addToCollectionStub = sinon.stub(db, 'addToCollection');
    fromUserDocumentStub = sinon.stub(User, 'fromUserDocument');
    bcryptHashStub = sinon.stub(bcrypt, 'hash');
    bcryptCompareStub = sinon.stub(bcrypt, 'compare');
    jwtSignStub = sinon.stub(jwt, 'sign');
    fsReadStub = sinon.stub(fs, 'readFileSync');

    process.env.JWT_PRIVATE_KEY = 'test-private-key';
    process.env.JWT_PUBLIC_KEY = 'test-public-key';
    delete process.env.JWT_PRIVATE_KEY_PATH;
    delete process.env.JWT_PUBLIC_KEY_PATH;
  });

  afterEach(() => {
    getByFieldStub.restore();
    addToCollectionStub.restore();
    fromUserDocumentStub.restore();
    bcryptHashStub.restore();
    bcryptCompareStub.restore();
    jwtSignStub.restore();
    fsReadStub.restore();

    delete process.env.JWT_PRIVATE_KEY;
    delete process.env.JWT_PUBLIC_KEY;
    delete process.env.JWT_PRIVATE_KEY_PATH;
    delete process.env.JWT_PUBLIC_KEY_PATH;
  });

  describe('registerUser', () => {
    it('should throw error if username already exists', async () => {
      getByFieldStub.resolves({ _id: 'u1', username: 'alice' });
      await expect(() => authService.registerUser('alice', 'pw')).rejects.toThrow('Username already exists.');
    });

    it('should hash password and insert user', async () => {
      getByFieldStub.resolves(null);
      bcryptHashStub.resolves('hash');
      addToCollectionStub.resolves({ acknowledged: true, insertedId: 'newId' });

      await authService.registerUser('alice', 'pw');

      expect(bcryptHashStub.calledOnce).toBe(true);
      expect(addToCollectionStub.calledOnce).toBe(true);
      const inserted = addToCollectionStub.firstCall.args[1];
      expect(inserted.username).toBe('alice');
      expect(inserted.hashedPassword).toBe('hash');
      expect(inserted.experience).toBe(0);
    });

    it('should throw error if insert not acknowledged', async () => {
      getByFieldStub.resolves(null);
      bcryptHashStub.resolves('hash');
      addToCollectionStub.resolves({ acknowledged: false });

      await expect(() => authService.registerUser('alice', 'pw')).rejects.toThrow('Error adding user to database');
    });
  });

  describe('validateLogin', () => {
    it('should throw if username not found', async () => {
      getByFieldStub.resolves(null);
      await expect(() => authService.validateLogin('missing', 'pw')).rejects.toThrow('Username not found.');
    });

    it('should throw if password invalid', async () => {
      const doc = { _id: 'u1', username: 'alice', hashedPassword: 'hash' };
      const user = { id: 'u1', username: 'alice', hashedPassword: 'hash' };
      getByFieldStub.resolves(doc);
      fromUserDocumentStub.returns(user);
      bcryptCompareStub.resolves(false);

      await expect(() => authService.validateLogin('alice', 'bad')).rejects.toThrow('Invalid password');
    });

    it('should return user with jwt and without hashedPassword', async () => {
      const doc = { _id: 'u1', username: 'alice', hashedPassword: 'hash', experience: 1 };
      const user = { id: 'u1', username: 'alice', hashedPassword: 'hash', experience: 1 };
      getByFieldStub.resolves(doc);
      fromUserDocumentStub.returns(user);
      bcryptCompareStub.resolves(true);
      jwtSignStub.returns('token');

      const result = await authService.validateLogin('alice', 'pw');

      expect(result.jwt).toBe('token');
      expect(result.hashedPassword).toBeUndefined();
      expect(jwtSignStub.calledOnce).toBe(true);
    });

    it('should load keys from files when env paths are provided', async () => {
      process.env.JWT_PRIVATE_KEY_PATH = 'privPath';
      process.env.JWT_PUBLIC_KEY_PATH = 'pubPath';
      fsReadStub.withArgs('privPath', 'utf8').returns('privFromFile');
      fsReadStub.withArgs('pubPath', 'utf8').returns('pubFromFile');

      const doc = { _id: 'u1', username: 'alice', hashedPassword: 'hash' };
      const user = { id: 'u1', username: 'alice', hashedPassword: 'hash' };
      getByFieldStub.resolves(doc);
      fromUserDocumentStub.returns(user);
      bcryptCompareStub.resolves(true);
      jwtSignStub.returns('token');

      await authService.validateLogin('alice', 'pw');

      expect(fsReadStub.called).toBe(true);
      expect(jwtSignStub.calledOnce).toBe(true);
    });
  });
});


