const schemaGenerator = require('../api/utils/schemaGenerator');

const SchemaMeta = require('../api/models/SchemaMeta');

const schemaRestify = require('../api/utils/schemaRestify');

const addRoutes = async (app, router) => {
  try {
    const metas = await SchemaMeta.find({}).lean();
    metas.forEach((meta) => {
      const schema = schemaGenerator.getSchemaFromMeta(meta);
      schemaRestify.addRestifyRoutes({ meta, schema }, router);
    });
    app.emit('ready');
  } catch (e) {
    console.error('Error retrieving schemas', e);
  }
};

module.exports = {
  addRoutes
};
