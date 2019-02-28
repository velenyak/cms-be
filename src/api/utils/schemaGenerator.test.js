const schemaGenerator = require('./schemaGenerator');

test('First dummy Test', () => {
  expect(3).toBe(3);
});

test('Add', () => {
  expect(schemaGenerator.add([1, 2, 3])).toBe(6);
});
