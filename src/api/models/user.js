const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
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
  password: {
    type: String
  },
  image: {
    type: String
  },
  roles: {
    type: [String],
    default: ['user']
  }
});

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
  }
  return next();
});

module.exports = mongoose.model('User', userSchema);
