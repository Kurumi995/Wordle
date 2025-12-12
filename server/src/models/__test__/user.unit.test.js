import { User } from '../user.js';

describe('User model', () => {
  describe('constructor', () => {
    it('should initialize fields and generate id when not provided', () => {
      const u = new User({ username: 'alice', hashedPassword: 'hash', experience: 3 });
      expect(typeof u.id).toBe('string');
      expect(u.id.length).toBeGreaterThan(0);
      expect(u.username).toBe('alice');
      expect(u.hashedPassword).toBe('hash');
      expect(u.experience).toBe(3);
    });
  });

  describe('updateProperties', () => {
    it('should update only provided fields', () => {
      const u = new User({ id: 'id1', username: 'a', hashedPassword: 'h1', experience: 1 });
      u.updateProperties({ username: 'b' });
      expect(u.id).toBe('id1');
      expect(u.username).toBe('b');
      expect(u.hashedPassword).toBe('h1');
      expect(u.experience).toBe(1);
    });
  });

  describe('fromUserDocument', () => {
    it('should return null for null/undefined document', () => {
      expect(User.fromUserDocument(null)).toBe(null);
      expect(User.fromUserDocument(undefined)).toBe(null);
    });

    it('should throw if _id is missing', () => {
      expect(() => User.fromUserDocument({ username: 'a' })).toThrow('Cannot find _id in User Document');
    });

    it('should convert _id to id and remove _id field', () => {
      const doc = { _id: { toString: () => 'u1' }, username: 'a', hashedPassword: 'h', experience: 2 };
      const user = User.fromUserDocument(doc);
      expect(user).toBeInstanceOf(User);
      expect(user.id).toBe('u1');
      expect(user.username).toBe('a');
      expect(user.hashedPassword).toBe('h');
      expect(user.experience).toBe(2);
      expect(doc._id).toBeUndefined();
    });
  });
});


