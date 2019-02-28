const mongoose = require('mongoose');
const _ = require('lodash');
const express = require('express');
const restify = require('express-restify-mongoose');

const schemaGenerator = require('../utils/schemaGenerator');
const { defaultTypes } = require('../../config/vars');
const app = require('../../config/express');

const schemaMetaSchema = new mongoose.Schema({
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
    typeOf: {
      type: String,
      required: true,
      enum: ['string', 'number', 'boolean', 'date', 'buffer']
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

schemaMetaSchema.path('methods').validate((methods) => {
  const availableMethods = ['post', 'put', 'delete'];
  return _.pullAll(availableMethods, methods).length;
});

schemaMetaSchema.pre('save', function (next) {
  const doc = this;
  doc.fields = doc.fields.map(field => ({
    ...field,
    typeOf: _.lowerCase(field.typeOf),
    ownRef: !defaultTypes.includes(field.type.toLowerCase())
  }));
  next();
});

// TODO: Register new routes in some other way
schemaMetaSchema.post('save', (doc) => {
  const schema = schemaGenerator.getSchemaFromMeta(doc);
  try {
    const router = express.Router();
    restify.serve(router, mongoose.model(_.upperFirst(doc.name), schema), {});
    // const app = require('../../config/express');
    app.use(router);
  } catch (e) {
    console.error(e);
    doc.remove((err) => {
      console.log(err);
    });
  }
});

module.exports = mongoose.model('SchemaMeta', schemaMetaSchema);
