import { safeParse, type ErrorMessage, type ObjectEntries, type ObjectIssue, type ObjectSchema } from 'valibot';
import type { PropertyValueSpecification } from '../PropertyValueSpecificationSchema';
import buildSchemaFromConstraintsRecursive from './buildSchemaFromConstraintsRecursive';

type ReviewAction = {
  '@context': 'https://schema.org';
  '@type': 'ReviewAction';
  target: {
    '@type': 'EntryPoint';
    urlTemplate: string;
    encodingType: string;
    contentType: string;
  };
  object: {
    '@type': 'Movie';
    url?: string | undefined;
    'url-input': PropertyValueSpecification;
  };
  result: {
    '@type': 'Review';
    url?: string | undefined;
    'url-output': PropertyValueSpecification;
    reviewBody?: string | undefined;
    'reviewBody-input': PropertyValueSpecification;
    reviewRating: {
      ratingValue?: number | string | (number | string)[] | undefined;
      'ratingValue-input'?: PropertyValueSpecification | undefined;
      'ratingValue-output'?: PropertyValueSpecification | undefined;
    };
  };
};

let reviewAction: ReviewAction;

beforeEach(() => {
  reviewAction = {
    '@context': 'https://schema.org',
    '@type': 'ReviewAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://api.example.com/review',
      encodingType: 'application/ld+json',
      contentType: 'application/ld+json'
    },
    object: {
      '@type': 'Movie',
      'url-input': 'required'
    },
    result: {
      '@type': 'Review',
      'url-output': 'required',
      'reviewBody-input': 'required',
      reviewRating: {
        ratingValue: [1, 2, 3, '4', '5'],
        'ratingValue-input': 'required',
        'ratingValue-output': 'required'
      }
    }
  };
});

describe('when multiple choices are given', () => {
  let inputSchema: ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>;

  beforeEach(() => {
    inputSchema = buildSchemaFromConstraintsRecursive(reviewAction, 'input');
  });

  test('should return true when value is in array (number)', () =>
    expect(
      safeParse(inputSchema, {
        object: { url: 'https://example.com/input' },
        result: {
          reviewBody: 'Great movie.',
          reviewRating: { ratingValue: 3 }
        }
      })
    ).toHaveProperty('success', true));

  test('should return true when value is in array (string)', () =>
    expect(
      safeParse(inputSchema, {
        object: { url: 'https://example.com/input' },
        result: {
          reviewBody: 'Great movie.',
          reviewRating: { ratingValue: '5' }
        }
      })
    ).toHaveProperty('success', true));

  test('should return false when value is not in the array', () =>
    expect(
      safeParse(inputSchema, {
        object: { url: 'https://example.com/input' },
        result: {
          reviewBody: 'Great movie.',
          reviewRating: { ratingValue: 5 }
        }
      })
    ).toHaveProperty('success', false));
});

test('should return true for output schema', () =>
  expect(
    safeParse(buildSchemaFromConstraintsRecursive(reviewAction, 'output'), {
      result: {
        url: 'https://example.com/result',
        reviewRating: { ratingValue: 1 }
      }
    })
  ).toHaveProperty('success', true));

test('should return true for empty schema', () =>
  expect(safeParse(buildSchemaFromConstraintsRecursive({}, 'input'), {})).toHaveProperty('success', true));
