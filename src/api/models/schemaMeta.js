const mongoose = require('mongoose');
const restful = require('node-restful');
const _ = require('lodash');
const express = require('express');
const restify = require('express-restify-mongoose');

const schemaGenerator = require('../utils/SchemaGenerator')();
const { defaultTypes } = require('../../config/vars');

const schemaMeta = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true,
    unique: true
  },
  fields: [{
    _id: false,
    name: {
      type: String,
      required: true,
      set: _.camelCase
    },
    type: {
      type: String,
      required: true
    },
    ownRef: {
      type: Boolean,
      default: false
    },
    isArray: {
      type: Boolean,
      default: false
    },
    options: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  methods: [{ type: String }]
});

schemaMeta.path('methods').validate((methods) => {
  const availableMethods = ['post', 'put', 'delete'];
  let invalidMethods = methods.map(method => {
    if (!availableMethods.includes(method)) {
      return method;
    }
  })
  return invalidMethods.length > 0;
})

schemaMeta.pre('save', function (next) {
  this.fields.map(f => {
    f.ownRef = !defaultTypes.includes(f.type.toLowerCase());
  })
  next();
})

schemaMeta.post('save', (doc) => {
  let schema = schemaGenerator.getSchemaFromMeta(doc);
  try {
    const router = express.Router();
    restify.serve(router, mongoose.model(doc.name, schema), {})
    const app = require('../../config/express');
    app.use(router)
  } catch (e) {
    console.error(e);
    doc.remove((err) => {
      console.log(err);
    })
  }
})

const SchemaMeta = mongoose.model('SchemaMeta', schemaMeta);
module.exports = SchemaMeta;