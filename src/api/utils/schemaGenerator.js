const mongoose = require('mongoose');
const _ = require('lodash');

const getDefaultTypes = () => (['string', 'number', 'boolean', 'date', 'buffer']);

const isDefaultType = type => _.includes(getDefaultTypes(), _.lowerCase(type));

const convertDefaultFieldType = (type, isArray, options) => isArray
  ? ({ type: [type.toLowerCase()], ...options })
  : ({ type: type.toLowerCase(), ...options });

const convertMongooseFieldType = (type, isArray, options, schemaName) => isArray
  ? ({ type: [mongoose.Schema.Types.ObjectId], ref: _.upperFirst(schemaName), ...options })
  : ({ type: mongoose.Schema.Types.ObjectId, ref: _.upperFirst(schemaName), ...options });

const getFieldData = ({ typeOf, isArray, options }, schemaName) => isDefaultType(typeOf)
  ? convertDefaultFieldType(typeOf, isArray, options)
  : convertMongooseFieldType(typeOf, isArray, options, schemaName);

const createMongooseSchema = schema => new mongoose.Schema(schema, { strict: false });

const getSchemaFromMeta = (meta) => {
  const schema = {};
  meta.fields.forEach((field) => {
    _.set(schema, _.camelCase(field.name), getFieldData(field, meta.name));
  });
  return createMongooseSchema(schema);
};

module.exports = {
  getDefaultTypes,
  isDefaultType,
  convertDefaultFieldType,
  convertMongooseFieldType,
  getFieldData,
  getSchemaFromMeta,
  createMongooseSchema
};
