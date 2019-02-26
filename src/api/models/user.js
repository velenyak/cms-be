const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: String,
  userId: String,
  email: String,
  roles: [String]
});

module.exports = mongoose.model('User', UserSchema);