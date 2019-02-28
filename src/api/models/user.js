const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  googleId: String,
  name: {
    userName: String,
    fullName: String
  },
  email: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  roles: {
    type: [String],
    default: ['user']
  }
});

module.exports = mongoose.model('User', UserSchema);
