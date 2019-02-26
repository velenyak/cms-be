const mongoose = require('mongoose');
const express = require('express');
const restify = require('express-restify-mongoose');
const { mongo, env } = require('./vars');

const restful = require('node-restful');
const schemaGenerator = require('../api/utils/SchemaGenerator')();

const SchemaMeta = require('../api/models/schemaMeta');

mongoose.Promise = global.Promise;

// Exit application on error
mongoose.connection.on('error', (err) => {
  console.error(`MongoDB connection error: ${err}`);
  process.exit(-1);
});

// print mongoose logs in dev env
if (env === 'development') {
  mongoose.set('debug', true);
}

/**
* Connect to mongo db
*
* @returns {object} Mongoose connection
* @public
*/
exports.connect = () => {
  mongoose.connect(mongo.uri, {
    keepAlive: 1
  });
  return mongoose.connection;
};

exports.createRoutes = async (app) => {
  const router = express.Router();
  let metas
  try {
    metas = await SchemaMeta.find({})
  } catch (e) {
    console.error('Error', e)
  }
  metas.map(meta => {
    const schema = schemaGenerator.getSchemaFromMeta(meta)
    let options = {
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
    }
    restify.serve(router, mongoose.model(meta.name, schema), options)
  })
  app.use(router);
}
