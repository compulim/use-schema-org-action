import { parse } from 'valibot';

import propertyValueSpecificationSchema, { type PropertyValueSpecification } from './PropertyValueSpecificationSchema';

describe('parse from string "name=abc required"', () => {
  let actual: PropertyValueSpecification;

  beforeEach(() => {
    actual = parse(propertyValueSpecificationSchema, 'name=abc required');
  });

  test('should have valueName of "abc"', () => expect(actual).toHaveProperty('valueName', 'abc'));
  test('should have valueRequired of true', () => expect(actual).toHaveProperty('valueRequired', true));
});

describe('parse from empty string', () => {
  let actual: PropertyValueSpecification;

  beforeEach(() => {
    actual = parse(propertyValueSpecificationSchema, '');
  });

  test('should not have valueName', () => expect(actual).not.toHaveProperty('valueName'));
  test('should not have valueRequired', () => expect(actual).not.toHaveProperty('valueRequired'));
});

describe('parse from object', () => {
  let actual: PropertyValueSpecification;

  beforeEach(() => {
    actual = parse(propertyValueSpecificationSchema, {
      '@type': 'PropertyValueSpecification',
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
    actual = parse(propertyValueSpecificationSchema, {});
  });

  test('should not have valueName', () => expect(actual).not.toHaveProperty('valueName'));
  test('should not have valueRequired', () => expect(actual).not.toHaveProperty('valueRequired'));
});

describe('parse from wrong object', () => {
  test('should throw', () =>
    expect(() => parse(propertyValueSpecificationSchema, { '@type': 'Something else' })).toThrow());
});
