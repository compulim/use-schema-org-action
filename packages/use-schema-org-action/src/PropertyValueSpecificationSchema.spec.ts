import { parse } from 'valibot';

import PropertyValueSpecificationSchema, { type PropertyValueSpecification } from './PropertyValueSpecificationSchema';

describe('parse from string "name=abc required"', () => {
  let actual: PropertyValueSpecification;

  beforeEach(() => {
    actual = parse(PropertyValueSpecificationSchema(), 'name=abc required');
  });

  test('should have valueName of "abc"', () => expect(actual).toHaveProperty('valueName', 'abc'));
  test('should have valueRequired of true', () => expect(actual).toHaveProperty('valueRequired', true));
});

describe('parse from empty string', () => {
  let actual: PropertyValueSpecification;

  beforeEach(() => {
    actual = parse(PropertyValueSpecificationSchema(), '');
  });

  test('should not have valueName', () => expect(actual).not.toHaveProperty('valueName'));
  test('should not have valueRequired', () => expect(actual).not.toHaveProperty('valueRequired'));
});

describe('parse from object', () => {
  let actual: PropertyValueSpecification;

  beforeEach(() => {
    actual = parse(PropertyValueSpecificationSchema(), {
      '@type': 'PropertyValueSpecificationSchema',
      valueName: 'abc',
      valueRequired: true
    });
  });

  test('should have valueName of "abc"', () => expect(actual).toHaveProperty('valueName', 'abc'));
  test('should have valueRequired of true', () => expect(actual).toHaveProperty('valueRequired', true));
});

describe('parse from empty object', () => {
  let actual: PropertyValueSpecification;

  beforeEach(() => {
    actual = parse(PropertyValueSpecificationSchema(), {});
  });

  test('should not have valueName', () => expect(actual).not.toHaveProperty('valueName'));
  test('should not have valueRequired', () => expect(actual).not.toHaveProperty('valueRequired'));
});
