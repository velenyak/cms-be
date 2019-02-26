const mongoose = require('mongoose');
const _ = require('lodash');

class SchemaGenerator {
  getFieldData ({ type, isArray, options }) {
    const defaultTypes = ['string', 'number', 'boolean', 'date', 'buffer'];
    if (defaultTypes.includes(type.toLowerCase())) {
      return isArray ? { type: [type.toLowerCase()], ...options } : { type: type.toLowerCase(), ...options };
    } else {
      return {
        type: isArray ? [ mongoose.Schema.Types.ObjectId ] : mongoose.Schema.Types.ObjectId,
        ref: type,
        ...options
      };
    }
  }

  getSchemaFromMeta (meta) {
    let schema = {};
    meta.fields.map(field => {
      _.set(schema, _.camelCase(field.name), this.getFieldData(field))
    });
    const mongooseSchema = new mongoose.Schema(schema, { strict: false });
    return mongooseSchema;
  }

  // async createSchemaFromMetaName (name) {
  //   let schema = {};
  //   const SchemaMeta = mongoose.models['SchemaMeta'];
  //   let meta = await SchemaMeta.find({ name: name })
  //   console.log('meta', meta);
  //   if (meta) {
  //     return this.getSchemaFromMeta(meta)
  //   } else {
  //     console.error('Can`t find meta', name)
  //     return null
  //   }
  // }

  // async getModel (name) {
  //   let model = mongoose.models[name];
  //   if (model) {
  //     return model;
  //   } else {
  //     let schema = await this.createSchemaFromMetaName(name);
  //     const mongooseSchema = new mongoose.Schema(schema, { strict: false });
  //     model = mongoose.model(name, mongooseSchema);
  //     return model;
  //   }
  // }
}

module.exports = (params) => new SchemaGenerator(params)