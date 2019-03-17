const mongoose = require('mongoose');
const restify = require('express-restify-mongoose');
const _ = require('lodash');
const jwt = require('jsonwebtoken');

const { auth } = require('../../config/vars');
const User = require('../models/User');

const acl = require('../middlewares/acl');

const defaultRestifyOptions = {
  totalCountHeader: true
};

const addRestifyRoutes = ({ meta, schema }, router) => {
  const mongooseModel = mongoose.model(_.upperFirst(_.camelCase(meta.name)), schema);
  const restrictMethodAccess = async (req, res, next) => {
    if (!meta.methods.includes(req.method)) {
      return res.status(404);
    }
    let token = req.headers.authorization;
    try {
      token = jwt.verify(token.replace('Bearer ', ''), auth.jwt.secret);
      const userId = _.get(token, 'user._id');
      if (userId) {
        const currentUser = await User.findById(userId).lean();
        req.user = currentUser;
      }
    } catch (e) {
      console.error('Error verifying token', e);
      const ability = await acl.definAbilitiesFor(null);
      req.ability = ability;
      return next();
    }
    const ability = await acl.definAbilitiesFor(req.user);
    req.ability = ability;
    console.log('PREMIDDLEWARE', req.user, req.ability);
    return next();
  };
  restify.serve(
    router,
    mongooseModel,
    _.merge(
      defaultRestifyOptions,
      { preMiddleware: restrictMethodAccess, ...meta.options }
    )
  );
};

module.exports = {
  addRestifyRoutes
};
