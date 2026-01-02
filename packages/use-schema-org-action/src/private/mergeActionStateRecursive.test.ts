import { expect } from 'expect';
import { beforeEach, test } from 'node:test';
import type { PropertyValueSpecification } from '../PropertyValueSpecificationSchema.ts';
import mergeActionStateRecursive from './mergeActionStateRecursive.ts';

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
      'url-input': 'required'
    },
    result: {
      '@type': 'Review',
      'url-output': 'required',
      'reviewBody-input': 'required',
      reviewRating: { 'ratingValue-input': 'required' }
    }
  };
});

test('update all inputs', () => {
  const base = {
    object: { url: 'https://example.com/input-1' },
    result: {
      url: 'https://example.com/output',
      reviewBody: 'yada, yada, yada',
      reviewRating: { ratingValue: '4' }
    }
  };

  const update = {
    object: { url: 'https://example.com/input-2' },
    result: {
      url: 'should-not-update',
      reviewBody: 'Great movie.',
      reviewRating: { ratingValue: 5 }
    }
  };

  const nextActionState = mergeActionStateRecursive(reviewAction, base, update, 'input');

  expect(nextActionState).toEqual({
    object: { url: 'https://example.com/input-2' },
    result: {
      url: 'https://example.com/output', // Should keep
      reviewBody: 'Great movie.',
      reviewRating: { ratingValue: 5 }
    }
  });
});

test('update some inputs', () => {
  const base = {
    object: { url: 'https://example.com/input-1' },
    result: {
      url: 'https://example.com/output',
      reviewBody: 'yada, yada, yada'
    }
  };

  const update = {
    object: { url: 'https://example.com/input-2' },
    result: {
      url: 'should-not-update',
      reviewRating: { ratingValue: 5 }
    }
  };

  const nextActionState = mergeActionStateRecursive(reviewAction, base, update, 'input');

  expect(nextActionState).toEqual({
    object: { url: 'https://example.com/input-2' },
    result: {
      url: 'https://example.com/output', // Should keep
      reviewBody: 'yada, yada, yada',
      reviewRating: { ratingValue: 5 }
    }
  });
});

test('extract inputs', () => {
  const base = {};

  const update = {
    object: { url: 'https://example.com/input' },
    result: {
      url: 'https://example.com/output',
      reviewBody: 'Great movie.',
      reviewRating: { ratingValue: 5 }
    }
  };

  const nextActionState = mergeActionStateRecursive(reviewAction, base, update, 'input');

  expect(nextActionState).toEqual({
    object: { url: 'https://example.com/input' },
    result: {
      // Should not extract "url" because it is for output.
      reviewBody: 'Great movie.',
      reviewRating: { ratingValue: 5 }
    }
  });
});

test('extract outputs', () => {
  const base = {};

  const update = {
    object: { url: 'https://example.com/input' },
    result: {
      url: 'https://example.com/output',
      reviewBody: 'Great movie.',
      reviewRating: { ratingValue: 5 }
    }
  };

  const nextActionState = mergeActionStateRecursive(reviewAction, base, update, 'output');

  expect(nextActionState).toEqual({
    result: {
      url: 'https://example.com/output'
    }
  });
});

test('extract no outputs', () => {
  const base = {
    result: {
      url: 'https://example.com/output'
    }
  };

  const update = {};

  const nextActionState = mergeActionStateRecursive(reviewAction, base, update, 'output');

  expect(nextActionState).toEqual({
    result: {
      url: 'https://example.com/output'
    }
  });
});

test('extract empty schema', () => {
  const base = {};
  const update = {};
  const nextActionState = mergeActionStateRecursive({}, base, update, 'output');

  expect(nextActionState).toEqual({});
});
