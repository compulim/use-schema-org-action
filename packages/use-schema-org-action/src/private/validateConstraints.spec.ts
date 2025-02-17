import buildSchemaFromConstraintsRecursive from './buildSchemaFromConstraintsRecursive';
import validateConstraints from './validateConstraints';

test('should return "valid" of true', () => {
  const validity = validateConstraints(buildSchemaFromConstraintsRecursive({ 'url-input': 'required' }, 'input'), {
    url: 'http://example.com'
  });

  expect(validity).toHaveProperty('valid', true);
});

test('should return "valid" of false', () => {
  const validity = validateConstraints(buildSchemaFromConstraintsRecursive({ 'url-input': 'required' }, 'input'), {});

  expect(validity).toHaveProperty('valid', false);
});
