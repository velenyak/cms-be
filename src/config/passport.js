const _ = require('lodash');
const passport = require('passport');
const { ExtractJwt, Strategy: JwtStrategy } = require('passport-jwt');

const User = require('../api/models/User');
const { auth } = require('./vars');

passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromHeader('authorization'),
  secretOrKey: auth.jwt.secret
};

const jwtStrategy = new JwtStrategy(jwtOptions, async (jwtPayload, next) => {
  // console.log(`Payload recieved: ${jwtPayload}`);
  const userId = _.get(jwtPayload, 'user._id');
  const user = await User.findById(userId);
  if (user) {
    next(null, user);
  } else {
    next(null, false);
  }
});

module.exports = {
  jwt: jwtStrategy
};
