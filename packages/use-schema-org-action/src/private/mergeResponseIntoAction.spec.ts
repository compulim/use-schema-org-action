import { type PartialDeep } from 'type-fest';
import { type ActionStatusType } from '../ActionStatusType';
import { type PropertyValueSpecification } from '../PropertyValueSpecificationSchema';
import mergeResponseIntoAction from './mergeResponseIntoAction';

test('should merge with official ReviewAction sample', () => {
  type ReviewAction = {
    '@context': 'https://schema.org';
    '@type': 'ReviewAction';
    actionStatus?: ActionStatusType | undefined;
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
        ratingValue?: number | string | undefined;
        'ratingValue-input': PropertyValueSpecification;
      };
    };
  };

  // [FROM-SPEC]
  const reviewAction: ReviewAction = {
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
        'ratingValue-input': 'required'
      }
    }
  };

  // [FROM-SPEC]
  const response: PartialDeep<ReviewAction> = {
    '@context': 'https://schema.org',
    '@type': 'ReviewAction',
    actionStatus: 'CompletedActionStatus',
    result: {
      '@type': 'Review',
      url: 'http://example.com/reviews/abc'
    }
  };

  const mergedResult = mergeResponseIntoAction(reviewAction, response);

  // [NOT-IN-SPEC]
  expect(mergedResult).toEqual({
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
      url: 'http://example.com/reviews/abc',
      'url-output': 'required',
      'reviewBody-input': 'required',
      reviewRating: {
        'ratingValue-input': 'required'
      }
    }
  });
});

test('should only merge properties with output constraints', () => {
  type Review = {
    '@type': 'Review';
    url?: string | undefined;
    'url-output': PropertyValueSpecification;
    reviewAspect?: string | undefined;
    'reviewAspect-output'?: PropertyValueSpecification;
    reviewBody?: string | undefined;
    'reviewBody-output'?: PropertyValueSpecification;
    result: {
      '@type': 'Rating';
      ratingValue?: number | string | undefined;
      'ratingValue-output': PropertyValueSpecification;
    };
  };

  // No "reviewAspect-output".
  const review: Review = {
    '@type': 'Review',
    'url-output': 'required',
    'reviewBody-output': 'required',
    result: {
      '@type': 'Rating',
      'ratingValue-output': 'required'
    }
  };

  // No "result".
  const response: PartialDeep<Review> = {
    '@type': 'Review',
    url: 'http://example.com/reviews/abc',
    reviewAspect: 'It is about something.',
    reviewBody: 'yada, yada, yada'
  };

  expect(mergeResponseIntoAction(review, response)).toEqual({
    '@type': 'Review',
    url: 'http://example.com/reviews/abc',
    'url-output': 'required',
    reviewBody: 'yada, yada, yada',
    'reviewBody-output': 'required',
    result: {
      '@type': 'Rating',
      'ratingValue-output': 'required'
    }
  });
});

test('should overwrite existing properties 1', () => {
  type Review = {
    '@type': 'Review';
    reviewBody?: string | undefined;
    'reviewBody-output'?: PropertyValueSpecification;
  };

  const review: Review = {
    '@type': 'Review',
    reviewBody: 'yada, yada, yada',
    'reviewBody-output': 'required'
  };

  const response: PartialDeep<Review> = {
    '@type': 'Review',
    reviewBody: 'Great movie.'
  };

  expect(mergeResponseIntoAction(review, response)).toEqual({
    ...review,
    reviewBody: 'Great movie.'
  });
});

test('should overwrite existing properties 2', () => {
  type Review = {
    '@type': 'Review';
    reviewBody?: string | undefined;
    'reviewBody-output'?: PropertyValueSpecification;
  };

  const review: Review = {
    '@type': 'Review',
    'reviewBody-output': 'required',
    reviewBody: 'yada, yada, yada'
  };

  const response: PartialDeep<Review> = {
    '@type': 'Review',
    reviewBody: 'Great movie.'
  };

  expect(mergeResponseIntoAction(review, response)).toEqual({
    ...review,
    reviewBody: 'Great movie.'
  });
});
