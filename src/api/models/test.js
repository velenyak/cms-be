const mongoose = require('mongoose');

const schemaMeta = new mongoose.Schema({
  name: {
    type: 'string',
    required: true
  }
});

const SchemaMeta = mongoose.model('Test', schemaMeta);
module.exports = SchemaMeta;
