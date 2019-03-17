/* eslint-disable func-names */
const mongoose = require('mongoose');
const _ = require('lodash');

const schemaMetaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
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
      required: true
      // enum: ['string', 'number', 'boolean', 'date', 'buffer']
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
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  }],
  methods: {
    type: [String],
    enum: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

schemaMetaSchema.pre('validate', function (next) {
  const doc = this;
  doc.fields = doc.fields.map(field => ({
    name: field.name,
    typeOf: _.lowerCase(field.typeOf),
    ownRef: !schemaMetaSchema.path('fields').schema.path('typeOf').enumValues.includes(_.lowerCase(field.typeOf)),
    isArray: field.isArray,
    options: field.options
  }));
  doc.methods = _.map(doc.methods, m => _.upperCase(m));
  next();
});

module.exports = mongoose.model('SchemaMeta', schemaMetaSchema);
