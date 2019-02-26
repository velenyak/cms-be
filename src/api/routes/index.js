const express = require('express');
const mongoose = require('mongoose');

const schema = require('./schema');

const router = express.Router();

/**
 * GET v1/status
 */
router.get('/status', (req, res) => res.send('<3'));

router.get('/test', async (req, res, next) => {
  let x = await mongoose.models.CarOwner.find({}).populate({ path: 'cars', model: mongoose.models['Car'] })
  res.json(x)
})

/**
 * GET api/docs
 */
router.use('/docs', express.static('docs'));

router.use('/schema', schema);

module.exports = router;
