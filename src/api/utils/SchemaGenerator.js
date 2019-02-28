const mongoose = require('mongoose');
const _ = require('lodash');

const getFieldData = ({ type, isArray, options }) => {
  const defaultTypes = ['string', 'number', 'boolean', 'date', 'buffer'];
  if (defaultTypes.includes(type.toLowerCase())) {
    return isArray
      ? { type: [type.toLowerCase()], ...options }
      : { type: type.toLowerCase(), ...options };
  }
  return {
    type: isArray
      ? [mongoose.Schema.Types.ObjectId]
      : mongoose.Schema.Types.ObjectId,
    ref: type,
    ...options
  };
};

exports.getFieldData = getFieldData;

exports.getSchemaFromMeta = (meta) => {
  const schema = {};
  meta.fields.forEach((field) => {
    _.set(schema, _.camelCase(field.name), getFieldData(field));
  });
  const mongooseSchema = new mongoose.Schema(schema, { strict: false });
  return mongooseSchema;
};
