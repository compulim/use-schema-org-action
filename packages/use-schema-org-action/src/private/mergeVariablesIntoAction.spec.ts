import { type ActionStatusType } from '../ActionStatusType';
import { type PropertyValueSpecification } from '../PropertyValueSpecificationSchema';
import mergeVariablesIntoAction from './mergeVariablesIntoAction';

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

describe('with official ReviewAction sample', () => {
  // SETUP: The action from the spec with modifications.
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

  describe('when merged with valid input variables', () => {
    let mergedAction: { isValid: boolean; value: ReviewAction };

    beforeEach(() => {
      mergedAction = mergeVariablesIntoAction(
        reviewAction,
        new Map<string, boolean | Date | number | string | undefined>([
          ['review', 'Great movie.'],
          ['rating', 5],
          ['url', 'https://example.com/']
        ]),
        'input'
      );
    });

    test('should return isValid of true', () => expect(mergedAction).toHaveProperty('isValid', true));
    test('should have input variables merged', () =>
      expect(mergedAction).toHaveProperty('value', {
        ...reviewAction,
        object: {
          ...reviewAction.object,
          url: 'https://example.com/'
        },
        result: {
          ...reviewAction.result,
          reviewBody: 'Great movie.',
          reviewRating: {
            ...reviewAction.result?.reviewRating,
            ratingValue: 5
          }
        }
      }));
  });

  describe('when merged with insufficient input variables', () => {
    let mergedAction: { isValid: boolean; value: ReviewAction };

    beforeEach(() => {
      mergedAction = mergeVariablesIntoAction(
        reviewAction,
        new Map<string, boolean | Date | number | string | undefined>([
          ['rating', undefined], // Should not emit "undefined".
          ['url', 'https://example.com/']
        ]),
        'input'
      );
    });

    test('should return isValid of false', () => expect(mergedAction).toHaveProperty('isValid', false));
    test('should have input variables merged', () =>
      expect(mergedAction).toHaveProperty('value', {
        ...reviewAction,
        object: {
          ...reviewAction.object,
          url: 'https://example.com/'
        }
      }));
  });

  describe('when merged with valid output variables', () => {
    let mergedAction: { isValid: boolean; value: ReviewAction };

    beforeEach(() => {
      mergedAction = mergeVariablesIntoAction(
        reviewAction,
        new Map<string, boolean | Date | number | string | undefined>([['url', 'https://example.com/']]),
        'output'
      );
    });

    test('should return isValid of true', () => expect(mergedAction).toHaveProperty('isValid', true));
    test('should have output variables merged', () =>
      expect(mergedAction).toHaveProperty('value', {
        ...reviewAction,
        result: {
          ...reviewAction.result,
          url: 'https://example.com/'
        }
      }));
  });
});

describe('when merged with PropertyValueSpecification without "valueName" property', () => {
  // SETUP: The action from the spec.
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
        'reviewBody-input': { valueRequired: true },
        reviewRating: {
          'ratingValue-input': { valueName: 'rating', valueRequired: true }
        }
      }
    };
  });

  test('should merge only with "valueName" property', () => {
    const { isValid, value } = mergeVariablesIntoAction(
      reviewAction,
      new Map<string, boolean | Date | number | string | undefined>([
        ['review', 'Great movie.'],
        ['rating', 5],
        ['url', 'https://example.com/']
      ]),
      'input'
    );

    expect(isValid).toBe(false);

    expect(value).toEqual({
      ...reviewAction,
      object: {
        ...reviewAction.object,
        url: 'https://example.com/'
      },
      result: {
        ...reviewAction.result,
        reviewRating: {
          ...reviewAction.result?.reviewRating,
          ratingValue: 5
        }
      }
    });
  });
});

describe('when merging partially filled action with partial input', () => {
  let isValid: boolean;
  let reviewAction: ReviewAction;
  let value: ReviewAction;

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
        url: 'https://example.com/input',
        'url-input': { valueName: 'url', valueRequired: true }
      },
      result: {
        '@type': 'Review',
        'url-output': { valueName: 'url', valueRequired: true },
        'reviewBody-input': { valueName: 'review', valueRequired: true },
        reviewRating: {
          ratingValue: 3,
          'ratingValue-input': { valueName: 'rating', valueRequired: true }
        }
      }
    };

    ({ isValid, value } = mergeVariablesIntoAction(
      reviewAction,
      new Map<string, boolean | Date | number | string | undefined>([
        ['rating', 5],
        ['review', 'Great movie.']
      ]),
      'input'
    ));
  });

  test('should return "isValid" of true', () => expect(isValid).toBe(true));
  test('should return action with preference over input values', () =>
    expect(value).toEqual({
      ...reviewAction,
      result: {
        ...reviewAction.result,
        reviewBody: 'Great movie.',
        reviewRating: {
          ...reviewAction.result?.reviewRating,
          ratingValue: 5
        }
      }
    }));
});
