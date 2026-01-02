import { expect } from 'expect';
import { test } from 'node:test';

import buildSchemaFromConstraintsRecursive from './buildSchemaFromConstraintsRecursive.ts';
import validateConstraints from './validateConstraints.ts';

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
