const passport = require('passport');
const _ = require('lodash');

exports.checkRoleWithPassport = (roles = [], strategy = 'jwt', opts = { session: false }) => (req, res, next) => passport.authenticate(strategy, opts, (err, user) => {
  if (err) return res.status(403).send('Error while authenticating!');
  if (!user) return res.status(403).send('No user found!');
  if (!roles.length || _.some(roles, r => user.roles.includes(r))) {
    // Put user into req
    req.user = user;
    return next();
  }
  return res.status(403).send('No user Id in token!');
})(req, res, next);
