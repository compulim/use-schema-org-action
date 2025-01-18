import type { ActionStatusType } from '../ActionStatusType';
import type { PropertyValueSpecification } from '../PropertyValueSpecificationSchema';
import extractVariablesFromAction from './extractVariablesFromAction';

type ReviewAction = {
  '@context'?: 'https://schema.org';
  '@type'?: 'ReviewAction';
  actionStatus?: ActionStatusType;
  target?: {
    '@type'?: 'EntryPoint';
    urlTemplate?: string;
    encodingType?: string;
    contentType?: string;
  };
  object?: {
    '@type'?: 'Movie';
    url?: string;
    'url-input'?: PropertyValueSpecification;
  };
  result?: {
    '@type'?: 'Review';
    url?: string;
    'url-output'?: PropertyValueSpecification;
    reviewBody?: string;
    'reviewBody-input'?: PropertyValueSpecification;
    reviewRating?: {
      ratingValue?: number;
      'ratingValue-input'?: PropertyValueSpecification;
    };
  };
};

test('should extract valid input values', () => {
  expect(
    Array.from(
      extractVariablesFromAction(
        {
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
            url: 'https://example.com/input',
            'url-input': { valueName: 'url', valueRequired: true }
          },
          result: {
            '@type': 'Review',
            'url-output': { valueName: 'url', valueRequired: true },
            reviewBody: 'Great movie.',
            'reviewBody-input': { valueName: 'review', valueRequired: true },
            reviewRating: {
              ratingValue: 5,
              'ratingValue-input': { valueName: 'rating', valueRequired: true }
            }
          }
        } satisfies ReviewAction,
        'input'
      )
    ).sort((x, y) => (x[0] > y[0] ? 1 : x[0] < y[0] ? -1 : 0))
  ).toEqual([
    ['rating', 5],
    ['review', 'Great movie.'],
    ['url', 'https://example.com/input']
  ]);
});

test('should extract invalid input values', () => {
  expect(
    Array.from(
      extractVariablesFromAction(
        {
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
            'url-input': { valueName: 'url', valueRequired: true }
          },
          result: {
            '@type': 'Review',
            'url-output': { valueName: 'url', valueRequired: true },
            'reviewBody-input': { valueName: 'review', valueRequired: true },
            reviewRating: {
              ratingValue: -1,
              'ratingValue-input': { maxValue: 5, minValue: 0, valueName: 'rating', valueRequired: true }
            }
          }
        } satisfies ReviewAction,
        'input'
      )
    ).sort((x, y) => (x[0] > y[0] ? 1 : x[0] < y[0] ? -1 : 0))
  ).toEqual([['rating', -1]]);
});

test('should extract output values', () => {
  expect(
    Array.from(
      extractVariablesFromAction(
        {
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
            url: 'https://example.com/input',
            'url-input': { valueName: 'url', valueRequired: true }
          },
          result: {
            '@type': 'Review',
            url: 'https://example.com/output',
            'url-output': { valueName: 'url', valueRequired: true },
            'reviewBody-input': { valueName: 'review', valueRequired: true },
            reviewRating: {
              'ratingValue-input': { maxValue: 5, minValue: 0, valueName: 'rating', valueRequired: true }
            }
          }
        } satisfies ReviewAction,
        'output'
      )
    )
  ).toEqual([['url', 'https://example.com/output']]);
});

test('should not extract property without a name', () => {
  expect(
    Array.from(
      extractVariablesFromAction(
        {
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
            url: 'https://example.com/input',
            'url-input': { valueRequired: true }
          },
          result: {
            '@type': 'Review',
            url: 'https://example.com/output',
            'url-output': { valueRequired: true },
            'reviewBody-input': { valueRequired: true },
            reviewRating: {
              'ratingValue-input': { maxValue: 5, minValue: 0, valueRequired: true }
            }
          }
        } satisfies ReviewAction,
        'output'
      )
    )
  ).toEqual([]);
});
