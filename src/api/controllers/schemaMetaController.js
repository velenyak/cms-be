const express = require('express');

const SchemaMeta = require('../models/SchemaMeta');
const schemaGenerator = require('../utils/schemaGenerator');
const schemaRestify = require('../utils/schemaRestify');

exports.createSchema = async (req, res, next) => {
  try {
    const schema = req.body;
    schema.owners = [req.user._id];
    const schemaMeta = new SchemaMeta(schema);
    const saved = await schemaMeta.save();
    const savedSchema = schemaGenerator.getSchemaFromMeta(saved);
    schemaRestify.addRestifyRoutes(
      {
        meta: saved,
        schema: savedSchema
      },
      express.Router()
    );
    return res.status(201).send(saved);
  } catch (e) {
    console.error('Error creating schema', e);
    return res.status(500).send(e.message);
  }
};

exports.listSchema = async (req, res, next) => {
  try {
    const metas = await SchemaMeta.accessibleBy(req.ability);
    return res.status(200).send(metas);
  } catch (e) {
    console.error('Error returning schemas', e);
    return res.status(500).send(e.message);
  }
};

exports.getSchema = async (req, res, next) => {
  try {
    const meta = await SchemaMeta.findOne({ name: { $regex: req.params.name, $options: 'i' } });
    const schema = schemaGenerator.getSchemaFromMeta(meta);
    return res.status(200).send({ meta, schema });
  } catch (e) {
    console.error('Error returning schema', e);
    return res.status(500).send(e.message);
  }
};
