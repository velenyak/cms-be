const restify = require('express-restify-mongoose');
const _ = require('lodash');
const passport = require('passport');
const moment = require('moment');
const mongoose = require('mongoose');

const schemaGenerator = require('../api/utils/schemaGenerator');

const User = require('../api/models/User');
const SchemaMeta = require('../api/models/SchemaMeta');

const addRoutes = async (app, router) => {
  // Define defaults for restify
  restify.defaults({
    preMiddleware: (req, res, next) => {
      passport.authenticate('jwt', { session: false }, (err, user, info) => {
        if (err) return res.send(500, 'Error while autehneticating!');
        if (info && info.expiredAt) {
          if (moment().isAfter(moment(info.expiredAt))) return res.status(401).send('Expired');
        }
        // All API Routes NOT protected
        // if (!user) {
        //   return res.status(403).send('Unathorized');
        // }
        if (!req.user && user) {
          _.set(req, 'user', user);
        }
        return next();
      })(req, res, next);
    },
    access: async (req, done) => {
      if (req.isAuthenticated() && req.user) {
        try {
          const user = await User.findById(req.user.id);
          if (user) {
            done(null, user.roles.includes('admin') ? 'private' : 'protected');
          }
        } catch (e) {
          done(e, 'public');
        }
      } else {
        done(null, 'public');
      }
    }
  });
  try {
    const metas = await SchemaMeta.find({}).lean();
    metas.forEach((meta) => {
      const schema = schemaGenerator.getSchemaFromMeta(meta);
      const model = mongoose.model(meta.name, schema);
      const options = {
        preRead: async (req, res, next) => {
          // if (req.query.populate) {
          //   let populateFields = req.query.populate.split(',');
          //   populateFields.map(field => {
          //     let f = meta.fields.find(f => f.name === field.trim())
          //     if (f && f.isArray) {
          //       console.log(f)
          //     }
          //   })
          // }
          console.log('Inside PreRead function');
          next();
        }
      };
      restify.serve(router, model, options);
    });
    app.emit('ready');
  } catch (e) {
    console.error('Error retrieving schemas', e);
  }
};

module.exports = {
  addRoutes
};
