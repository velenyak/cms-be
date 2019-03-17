/* eslint-disable func-names */
const mongoose = require('mongoose');
const mongooseDelete = require('mongoose-delete');
const { accessibleRecordsPlugin } = require('@casl/mongoose');
const bcrypt = require('bcrypt');
const _ = require('lodash');

const userSchema = new mongoose.Schema({
  googleId: String,
  name: {
    userName: {
      type: String,
      default() {
        return _.camelCase(this.name.fullName);
      }
    },
    fullName: {
      type: String,
      required: true
    }
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
}, {
  timestamps: true
});

userSchema.plugin(mongooseDelete, { deletedAt: true, overrideMethods: true });
userSchema.plugin(accessibleRecordsPlugin);

userSchema.pre('save', async function (next) {
  const user = this;
  if (user.isModified('password')) {
    const hash = await bcrypt.hash(user.password, 10);
    user.password = hash;
  }
  return next();
});

module.exports = mongoose.model('User', userSchema);
