import { result } from 'lodash';
import type { PropertyValueSpecification } from '../PropertyValueSpecificationSchema';
import sortEntries from '../test/sortEntries';
import extractVariablesFromActionStateRecursive from './extractVariablesFromActionStateRecursive';

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
      ratingValue?: number | number[] | string | string[] | undefined;
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
      'url-input': 'name=url required'
    },
    result: {
      '@type': 'Review',
      'url-output': 'name=url required',
      'reviewBody-input': 'name=review required',
      reviewRating: {
        'ratingValue-input': 'name=rating required'
      }
    }
  };
});

test('with full inputs', () => {
  const actionState = {
    object: {
      url: 'https://example.com/input'
    },
    result: {
      url: 'https://example.com/output',
      reviewBody: 'Great movie.',
      reviewRating: {
        ratingValue: 5
      }
    }
  };

  const variables = extractVariablesFromActionStateRecursive(reviewAction, actionState, 'input');

  expect(sortEntries(variables)).toEqual([
    ['rating', 5],
    ['review', 'Great movie.'],
    ['url', 'https://example.com/input']
  ]);
});

test('with partial inputs', () => {
  const actionState = {
    result: {
      url: 'https://example.com/output',
      reviewBody: 'Great movie.',
      reviewRating: {
        ratingValue: 5
      }
    }
  };

  const variables = extractVariablesFromActionStateRecursive(reviewAction, actionState, 'input');

  expect(sortEntries(variables)).toEqual([
    ['rating', 5],
    ['review', 'Great movie.'],
    ['url', undefined]
  ]);
});

test('with full outputs', () => {
  const actionState = {
    object: {
      url: 'https://example.com/input'
    },
    result: {
      url: 'https://example.com/output',
      reviewBody: 'Great movie.',
      reviewRating: {
        ratingValue: 5
      }
    }
  };

  const variables = extractVariablesFromActionStateRecursive(reviewAction, actionState, 'output');

  expect(sortEntries(variables)).toEqual([['url', 'https://example.com/output']]);
});

test('should not extract input variables without a name', () => {
  const actionState = {
    object: {
      url: 'https://example.com/input'
    },
    result: {
      url: 'https://example.com/output',
      reviewBody: 'Great movie.',
      reviewRating: {
        ratingValue: 5
      }
    }
  };

  const variables = extractVariablesFromActionStateRecursive(
    {
      ...reviewAction,
      result: {
        ...reviewAction.result,
        'reviewBody-input': 'required'
      }
    },
    actionState,
    'input'
  );

  expect(sortEntries(variables)).toEqual([
    ['rating', 5],
    ['url', 'https://example.com/input']
  ]);
});

test('should not extract output variables without a name', () => {
  const actionState = {
    object: {
      url: 'https://example.com/input'
    },
    result: {
      url: 'https://example.com/output',
      reviewBody: 'Great movie.',
      reviewRating: {
        ratingValue: 5
      }
    }
  };

  const variables = extractVariablesFromActionStateRecursive(
    {
      ...reviewAction,
      result: {
        ...reviewAction.result,
        'url-output': 'required'
      }
    },
    actionState,
    'output'
  );

  expect(sortEntries(variables)).toEqual([]);
});
