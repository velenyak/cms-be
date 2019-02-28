const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');
const _ = require('lodash');
const bcrypt = require('bcrypt');

const { auth } = require('../../config/vars');
const User = require('../models/User');

const googleClient = new OAuth2Client(auth.google.client_id);

const signToken = user => jwt.sign(
  { user },
  auth.jwt.secret,
  { expiresIn: auth.jwt.expiration },
);

exports.googleLogin = async (req, res) => {
  try {
    const ticket = await googleClient.verifyIdTokenAsync({
      idToken: req.body.accessToken,
      audience: auth.google.client_id
    });
    const payload = ticket.getPayload();
    const googleId = payload.sub;
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = new User({
        googleId,
        email: payload.email,
        name: {
          fullName: payload.name,
          userName: _.camelCase(payload.name)
        },
        image: payload.picture
      });
      user = await user.save();
    }
    const token = signToken(_.pick(user, ['_id', 'email', 'name', 'roles']));
    return res.status(201).send({ user: _.omit(user, ['password', 'deviceToken']), token });
  } catch (e) {
    console.error('Error verifying google token', e);
    return res.status(500).send(e.message);
  }
};

exports.localLogin = async (req, res, next) => {
  const user = req.body.email
    ? await User.findOne({ email: req.body.email }).lean()
    : await User.findOne({ 'name.userName': _.get(req.body, 'name.userName', req.body.userName) }).lean();
  if (!user) return res.status(404).send('User not found');
  const match = await bcrypt.compare(req.body.password, user.password);
  if (match) {
    const token = signToken(_.pick(user, ['_id', 'email', 'name', 'roles']));
    user.password = undefined;
    return res.status(200).send({ user, token });
  }
  return res.status(403).send('Bad credentials!');
};

exports.register = async (req, res, next) => {
  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) {
      return res.status(400).send('A megadott e-mail címmel már regisztráltak az alkalmazásba');
    }
    user = new User({
      email: req.body.email,
      password: req.body.password,
      name: {
        fullName: req.body.name.fullName,
        userName: _.camelCase(req.body.name.fullName)
      },
      deviceToken: req.body.deviceToken
    });
    const savedUser = await user.save();
    return res.status(201).send({ user: _.omit(savedUser, ['password', 'deviceToken']) });
  } catch (e) {
    return res.status(500).send(e.message);
  }
};

exports.refreshToken = async (req, res, next) => {
  let token = req.headers.authorization;
  try {
    token = jwt.verify(token, process.env.SECRET, { ignoreExpiration: true });
    const userId = _.get(token, 'user._id');
    if (userId) {
      const currentUser = await User.findById(userId);
      token = signToken(_.pick(currentUser, ['_id', 'email', 'name', 'roles']));
      delete currentUser.password;
      return res.status(200).send({ user: currentUser, token });
    }
  } catch (e) {
    console.error('Error verifying token', e);
    return res.status(403).send();
  }
  return res.status(403).send();
};
