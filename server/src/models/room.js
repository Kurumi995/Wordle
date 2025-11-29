class Room {
  id = '';
  isPublic = true;
  hashedPassword = '';
  creatorId = '';
  targetWord = '';

  constructor(roomFields) {
    const id = roomFields.id ?? String(Date.now());
    this.updateProperties({id, ...roomFields});
  }

  updateProperties = (roomFields) => {
    this.id = roomFields.id ?? this.id;
    this.isPublic = roomFields.isPublic ?? this.isPublic;
    this.hashedPassword = roomFields.hashedPassword ?? this.hashedPassword;
    this.creatorId = roomFields.creatorId ?? this.creatorId;
    this.targetWord = roomFields.targetWord ?? this.targetWord;
  }

  static fromRoomDocument = (roomDocument) => {
    if (!roomDocument) {
      return null;
    }
    const id = roomDocument._id?.toString();
    if (!id) {
      throw new Error('Cannot find _id in Room Document');
    }
    delete roomDocument._id;
    const room = new Room({id, ...roomDocument});
    return room;
  }
}

export { Room };

