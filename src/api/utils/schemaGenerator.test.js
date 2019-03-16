const mongoose = require('mongoose');

const schemaGenerator = require('./schemaGenerator');

describe('Schema Generator - getDefaultTypes', () => {
  it('Return enum values from schema meta field type', () => {
    expect(schemaGenerator.getDefaultTypes()).toContain('string');
    expect(schemaGenerator.getDefaultTypes()).toContain('number');
    expect(schemaGenerator.getDefaultTypes()).toContain('boolean');
    expect(schemaGenerator.getDefaultTypes()).toContain('date');
    expect(schemaGenerator.getDefaultTypes()).toContain('buffer');
    expect(schemaGenerator.getDefaultTypes()).toHaveLength(5);
  });
});

describe('Schema Generator - isDefaultType', () => {
  it('Returns true if type is one of default types', () => {
    expect(schemaGenerator.isDefaultType('string')).toBe(true);
  });
  it('Returns true even if type is in different case', () => {
    expect(schemaGenerator.isDefaultType('Boolean')).toBe(true);
  });
  it('Return false if type is not one of default cases', () => {
    expect(schemaGenerator.isDefaultType('Car')).toBe(false);
  });
});

describe('Schema Generator - getFieldData', () => {
  it('Return mongoose schema object from field simple data', () => {
    expect(schemaGenerator.getFieldData({ typeOf: 'String', isArray: false, options: {} }))
      .toEqual({ type: 'string' });
  });
  it('Return mongoose schema object from field simple array type data', () => {
    expect(schemaGenerator.getFieldData({ typeOf: 'String', isArray: true, options: {} }))
      .toEqual({ type: ['string'] });
  });
  it('Return mongoose schema object from field that references other collection', () => {
    expect(schemaGenerator.getFieldData({ typeOf: 'Car', isArray: false, options: {} }, 'Car'))
      .toEqual({ type: mongoose.Schema.Types.ObjectId, ref: 'Car' });
  });
  it('Return mongoose schema object from field that references other collection with correct name', () => {
    expect(schemaGenerator.getFieldData({ typeOf: 'person', isArray: false, options: {} }, 'person'))
      .toEqual({ type: mongoose.Schema.Types.ObjectId, ref: 'Person' });
  });
  it('Return mongoose schema object from field that references other collection in array', () => {
    expect(schemaGenerator.getFieldData({ typeOf: 'person', isArray: true, options: {} }, 'Person'))
      .toEqual({ type: [mongoose.Schema.Types.ObjectId], ref: 'Person' });
  });
  it('Return mongoose schema object from field containing options', () => {
    expect(schemaGenerator.getFieldData({ typeOf: 'String', isArray: false, options: { required: true, enum: ['a', 'b', 'c'] } }))
      .toEqual({ type: 'string', required: true, enum: ['a', 'b', 'c'] });
  });
});

describe('Schema Generator - getSchemaFromMeta', () => {
  it('return mongoose schema from meta data', () => {
    const meta = {
      name: 'Car',
      fields: [
        {
          name: 'name', typeOf: 'String', ownRef: false, options: { required: true }
        },
        { name: 'model', typeOf: 'String', ownRef: false },
        { name: 'makeYear', typeOf: 'Number', ownRef: false }
      ]
    };
    const mongooseSchema = mongoose.Schema(
      {
        name: { type: 'string', required: true },
        model: { type: 'string' },
        makeYear: { type: 'number' }
      },
      { strict: false }
    );
    compareSchemas(schemaGenerator.getSchemaFromMeta(meta), mongooseSchema, ['name', 'model', 'makeYear']);
  });
});

const compareSchemas = (schema1, schema2, paths = []) => {
  paths.forEach((path) => {
    const schema1Path = schema1.path(path);
    const schema2Path = schema2.path(path);
    expect(schema1Path.instance).toEqual(schema2Path.instance);
    expect(schema1Path.options).toEqual(schema2Path.options);
    expect(schema1Path.isRequired).toEqual(schema2Path.isRequired);
    expect(schema1Path.enumValues).toEqual(schema2Path.enumValues);
  });
};
