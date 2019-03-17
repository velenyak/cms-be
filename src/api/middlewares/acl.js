const passport = require('passport');
const _ = require('lodash');
const { AbilityBuilder, Ability } = require('@casl/ability');

const SchemaMeta = require('../models/SchemaMeta');

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

const definAbilitiesFor = async (user) => {
  const { rules, can } = AbilityBuilder.extract();

  if (!user) {
    can(['create'], ['User']);
    return new Ability(rules);
  }

  const userCollections = await SchemaMeta.find({ owner: user._id }).select('name').lean();
  can(['create', 'delete', 'update'], userCollections.map(c => c.name));
  can(['read', 'update'], 'User', { _id: user.id });
  can(['create'], ['SchemaMeta']);
  can(['read', 'delete', 'update'], ['SchemaMeta'], { owner: user._id });

  return new Ability(rules);
};

exports.defineAbilities = async (req, res, next) => {
  req.ability = await definAbilitiesFor(req.user);
  return next();
};
