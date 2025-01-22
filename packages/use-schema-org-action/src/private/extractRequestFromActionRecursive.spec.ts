import { type PartialDeep } from 'type-fest';
import { type ActionStatusType } from '../ActionStatusType';
import { type PropertyValueSpecification } from '../PropertyValueSpecificationSchema';
import extractRequestFromActionRecursive from './extractRequestFromActionRecursive';

describe('With "ReviewAction"', () => {
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

  let reviewAction: ReviewAction;

  beforeEach(() => {
    // [FROM-SPEC]
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
          'ratingValue-input': 'required'
        }
      }
    };

    reviewAction = {
      ...reviewAction,
      object: {
        ...reviewAction.object,
        url: 'http://example.com/movies/123'
      },
      result: {
        ...reviewAction.result,
        reviewBody: 'yada, yada, yada',
        reviewRating: {
          ...reviewAction.result?.reviewRating,
          ratingValue: '4'
        }
      }
    };
  });

  describe('when extractRequestFromActionRecursive() is called', () => {
    let request: PartialDeep<ReviewAction> | undefined;

    beforeEach(() => {
      request = extractRequestFromActionRecursive(reviewAction);
    });

    test('should not return empty object', () =>
      expect(typeof request !== 'undefined' && 'target' in request).toBe(false));

    test('should return request', () =>
      expect(request).toEqual({
        object: {
          url: 'http://example.com/movies/123'
        },
        result: {
          reviewBody: 'yada, yada, yada',
          reviewRating: {
            ratingValue: '4'
          }
        }
      }));
  });
});
