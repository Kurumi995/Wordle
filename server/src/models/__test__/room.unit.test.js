import { Room } from '../room.js';

describe('Room model', () => {
  describe('constructor', () => {
    it('should initialize fields and generate id when not provided', () => {
      const r = new Room({ isPublic: false, hashedPassword: 'hash', creatorId: 'c1', targetWord: 'APPLE' });
      expect(typeof r.id).toBe('string');
      expect(r.id.length).toBeGreaterThan(0);
      expect(r.isPublic).toBe(false);
      expect(r.hashedPassword).toBe('hash');
      expect(r.creatorId).toBe('c1');
      expect(r.targetWord).toBe('APPLE');
    });
  });

  describe('updateProperties', () => {
    it('should update only provided fields', () => {
      const r = new Room({ id: 'r1', isPublic: true, hashedPassword: '', creatorId: 'c1', targetWord: 'APPLE' });
      r.updateProperties({ isPublic: false, hashedPassword: 'h2' });
      expect(r.id).toBe('r1');
      expect(r.isPublic).toBe(false);
      expect(r.hashedPassword).toBe('h2');
      expect(r.creatorId).toBe('c1');
      expect(r.targetWord).toBe('APPLE');
    });
  });

  describe('fromRoomDocument', () => {
    it('should return null for null/undefined document', () => {
      expect(Room.fromRoomDocument(null)).toBe(null);
      expect(Room.fromRoomDocument(undefined)).toBe(null);
    });

    it('should throw if _id is missing', () => {
      expect(() => Room.fromRoomDocument({ isPublic: true })).toThrow('Cannot find _id in Room Document');
    });

    it('should convert _id to id and remove _id field', () => {
      const doc = { _id: { toString: () => 'r1' }, isPublic: true, hashedPassword: '', creatorId: 'c1', targetWord: 'APPLE' };
      const room = Room.fromRoomDocument(doc);
      expect(room).toBeInstanceOf(Room);
      expect(room.id).toBe('r1');
      expect(room.isPublic).toBe(true);
      expect(room.creatorId).toBe('c1');
      expect(room.targetWord).toBe('APPLE');
      expect(doc._id).toBeUndefined();
    });
  });
});


