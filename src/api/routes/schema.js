const express = require('express');
const asyncHandler = require('express-async-handler');

const SchemaMeta = require('../models/schemaMeta');

const router = express.Router();

router.post('/', asyncHandler(async (req, res, next) => {
  const schema = req.body
  const schemaMeta = new SchemaMeta(schema)
  let saved = await schemaMeta.save();
  res.status(201).send(saved);
}))

router.get('/', asyncHandler (async (req, res, next) => {
  let metas = await SchemaMeta.find({});
  res.status(200).send(metas);
}))

router.get('/:name', asyncHandler (async (req, res, next) => {
  let meta = await SchemaMeta.findOne({ name: { $regex: req.params.name, $options: 'i' } });
  res.status(200).send(meta);
}))

module.exports = router;