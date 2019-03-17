const express = require('express');
const _ = require('lodash');
const mongoose = require('mongoose');
const restify = require('express-restify-mongoose');

const SchemaMeta = require('../models/SchemaMeta');
const schemaGenerator = require('../utils/schemaGenerator');
const acl = require('../middlewares/acl');

const router = express.Router();

router.post('/', acl.checkRoleWithPassport(['user']), async (req, res, next) => {
  try {
    const schema = req.body;
    schema.owner = req.user._id;
    const schemaMeta = new SchemaMeta(schema);
    const saved = await schemaMeta.save();
    const savedSchema = schemaGenerator.getSchemaFromMeta(saved);
    restify.serve(router, mongoose.model(_.upperFirst(saved.name), savedSchema), {});
    return res.status(201).send(saved);
  } catch (e) {
    console.error('Error creating schema', e);
    return res.status(500).send(e.message);
  }
});

router.get('/', acl.checkRoleWithPassport(['user']), async (req, res, next) => {
  try {
    const metas = await SchemaMeta.find({});
    return res.status(200).send(metas);
  } catch (e) {
    console.error('Error returning schemas', e);
    return res.status(500).send(e.message);
  }
});

router.get('/:name', async (req, res, next) => {
  try {
    const meta = await SchemaMeta.findOne({ name: { $regex: req.params.name, $options: 'i' } });
    const schema = schemaGenerator.getSchemaFromMeta(meta);
    return res.status(200).send({ meta, schema });
  } catch (e) {
    console.error('Error returning schema', e);
    return res.status(500).send(e.message);
  }
});

module.exports = router;
