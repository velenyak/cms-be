const express = require('express');

const SchemaMeta = require('../models/schemaMeta');

const router = express.Router();

router.post('/', async (req, res, next) => {
  const schema = req.body;
  const schemaMeta = new SchemaMeta(schema);
  const saved = await schemaMeta.save();
  res.status(201).send(saved);
});

router.get('/', async (req, res, next) => {
  const metas = await SchemaMeta.find({});
  res.status(200).send(metas);
});

router.get('/:name', async (req, res, next) => {
  const meta = await SchemaMeta.findOne({ name: { $regex: req.params.name, $options: 'i' } });
  res.status(200).send(meta);
});

module.exports = router;
