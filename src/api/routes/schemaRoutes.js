const express = require('express');

const acl = require('../middlewares/acl');
const schemaMetaController = require('../controllers/schemaMetaController');

const router = express.Router();

router.post(
  '/',
  acl.checkRoleWithPassport(['user']),
  acl.defineAbilities,
  schemaMetaController.createSchema
);

router.get(
  '/',
  acl.checkRoleWithPassport(['user']),
  acl.defineAbilities,
  schemaMetaController.listSchema
);

router.get(
  '/:name',
  acl.checkRoleWithPassport(['user']),
  acl.defineAbilities,
  schemaMetaController.getSchema
);

module.exports = router;
