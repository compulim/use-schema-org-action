import { type PropertyValueSpecification } from '../PropertyValueSpecificationSchema';
import validateConstraints from './validateConstraints';

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
      ratingValue?: number | undefined;
      'ratingValue-input'?: PropertyValueSpecification | undefined;
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
      'url-input': { valueName: 'url', valueRequired: true }
    },
    result: {
      '@type': 'Review',
      'url-output': { valueName: 'url', valueRequired: true },
      'reviewBody-input': { valueName: 'review', valueRequired: true },
      reviewRating: {
        'ratingValue-input': { valueName: 'rating', valueRequired: true }
      }
    }
  };
});

describe('when all input properties are set', () => {
  beforeEach(() => {
    reviewAction = {
      ...reviewAction,
      object: {
        ...reviewAction.object,
        url: 'https://example.com/input'
      },
      result: {
        ...reviewAction.result,
        reviewBody: 'Great movie.',
        reviewRating: {
          ratingValue: 5
        }
      }
    };
  });

  test('should return valid for input', () =>
    expect(validateConstraints(reviewAction, 'input')).toHaveProperty('valid', true));

  test('should return invalid for output', () =>
    expect(validateConstraints(reviewAction, 'output')).toHaveProperty('valid', false));
});

describe('when all output properties are set', () => {
  beforeEach(() => {
    reviewAction = {
      ...reviewAction,
      result: {
        ...reviewAction.result,
        url: 'https://example.com/output'
      }
    };
  });

  test('should return valid for input', () =>
    expect(validateConstraints(reviewAction, 'input')).toHaveProperty('valid', false));

  test('should return invalid for output', () =>
    expect(validateConstraints(reviewAction, 'output')).toHaveProperty('valid', true));
});
