const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const BearerStrategy = require('passport-http-bearer');
const GoogleStrategy = require('passport-google-oauth2').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { jwt } = require('./vars');
const { auth } = require('./vars');
const User = require('../api/models/user');

passport.serializeUser((user, done) => {
  done(null, user._id);
})

passport.deserializeUser(async (id, done) => {
  let user = await User.findOne({ _id: id });
  done(null, user);
})

const jwtOptions = {
  secretOrKey: jwtSecret,
  jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme('Bearer'),
};

const JwtStrategy = async (payload, done) => {
  try {
    const user = await User.findById(payload.sub);
    if (user) return done(null, user);
    return done(null, false);
  } catch (error) {
    return done(error, false);
  }
};

exports.jwt = new JwtStrategy(jwtOptions, jwt);

const googleStrategy = new GoogleStrategy({
  clientID: auth.google.client_id,
  clientSecret: auth.google.client_secret,
  callbackURL: 'http://localhost:3000/auth/google/callback'
}, async (token, refreshToken, profile, done) => {
  process.nextTick(async () => {
    console.log('PROFILE', profile)
    let user
    try {
      user = await User.findOne({ userId: profile.id })
    } catch(err) {
      console.error(err)
      return done(err)
    }
    if (user) {
      return done(null, user)
    } else {
      let newUser = new User({
        name: profile.displayName,
        userId: profile.id,
        email: profile.emails[0].value
      })
      try {
        user = await newUser.save()
        return done(null, user)
      } catch(err) {
        console.error(err)
        throw err
      }
    }
  })
});

exports.google = googleStrategy;