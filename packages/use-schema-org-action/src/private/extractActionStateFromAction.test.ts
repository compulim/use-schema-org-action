import { expect } from 'expect';
import { test } from 'node:test';
import extractActionStateFromAction from './extractActionStateFromAction.ts';

test('should work', () => {
  const actionState = extractActionStateFromAction({
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
      'url-input': 'name=url required'
    },
    result: {
      '@type': 'Review',
      'url-output': 'name=url required',
      'reviewBody-input': 'name=review required',
      reviewRating: {
        ratingValue: undefined,
        'ratingValue-input': 'name=rating required'
      },
      url: 'https://example.com/output'
    }
  });

  expect(actionState).toStrictEqual({
    object: { url: 'https://example.com/input' },
    result: {
      reviewBody: undefined,
      reviewRating: { ratingValue: undefined },
      url: 'https://example.com/output'
    }
  });
});
