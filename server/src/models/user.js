class User {
  id = '';
  username = '';
  hashedPassword = '';
  experience = 0;

  constructor(userFields) {
    const id = userFields.id ?? String(Date.now());
    this.updateProperties({id, ...userFields});
  }

  updateProperties = (userFields) => {
    this.id = userFields.id ?? this.id;
    this.username = userFields.username ?? this.username;
    this.hashedPassword = userFields.hashedPassword ?? this.hashedPassword;
    this.experience = userFields.experience ?? this.experience;
  }

  static fromUserDocument = (userDocument) => {
    if (!userDocument) {
      return null;
    }
    const id = userDocument._id?.toString();
    if (!id) {
      throw new Error('Cannot find _id in User Document');
    }
    delete userDocument._id;
    const user = new User({id, ...userDocument});
    return user;
  }
}

export { User };

