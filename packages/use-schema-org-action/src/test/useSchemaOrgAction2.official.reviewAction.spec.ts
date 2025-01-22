/** @jest-environment ./src/test/jsdomEnvironmentWithWritableStream.js */

import { act } from 'react';
import { type ActionStatusType } from '../ActionStatusType';
import { type PropertyValueSpecification } from '../PropertyValueSpecificationSchema';
import useSchemaOrgAction, { type ActionHandler } from '../useSchemaOrgAction2';
import { type MockOf } from './MockOf';
import renderHook, { type RenderHookResult } from './renderHook';
import sortEntries from './sortEntries';

describe('Spec: Movie review site API with -input and -output', () => {
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
        ratingValue?: string;
        'ratingValue-input'?: PropertyValueSpecification;
      };
    };
  };

  let handler: MockOf<ActionHandler<ReviewAction>>;
  let renderResult: RenderHookResult<ReturnType<typeof useSchemaOrgAction<ReviewAction>>>;
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

    handler = jest.fn().mockResolvedValueOnce(
      // [FROM-SPEC]
      Promise.resolve({
        '@context': 'https://schema.org',
        '@type': 'ReviewAction',
        actionStatus: 'CompletedActionStatus',
        result: {
          '@type': 'Review',
          url: 'http://example.com/reviews/abc'
        }
      })
    );
  });

  describe('when render useSchemaOrgAction() hook', () => {
    beforeEach(() => {
      renderResult = renderHook(() => useSchemaOrgAction(reviewAction, handler));
    });

    describe('when merged with input', () => {
      beforeEach(() =>
        act(() =>
          // [NOT-IN-SPEC]
          renderResult.result.current[1](action => ({
            ...action,
            object: {
              ...action.object,
              url: 'http://example.com/movies/123'
            },
            result: {
              ...action.result,
              reviewBody: 'yada, yada, yada',
              reviewRating: {
                ...action.result?.reviewRating,
                ratingValue: '4'
              }
            }
          }))
        )
      );

      describe('when submit() is called', () => {
        beforeEach(() => act(() => renderResult.result.current[2].submit()));

        test('should be called once', () => expect(handler).toHaveBeenCalledTimes(1));

        test('should be called with empty input', () =>
          expect(sortEntries(handler.mock.calls[0]?.[0] || [])).toEqual([]));

        test('should be called with request', () =>
          // [FROM-SPEC] But the spec is not exactly correct.
          expect(handler.mock.calls[0]?.[1]).toEqual({
            object: { url: 'http://example.com/movies/123' },
            result: {
              reviewBody: 'yada, yada, yada',
              reviewRating: { ratingValue: '4' }
            }
          }));

        test('should merge response', () =>
          // [NOT-IN-SPEC]
          expect(renderResult.result.current[0]).toEqual({
            '@context': 'https://schema.org',
            '@type': 'ReviewAction',
            actionStatus: 'CompletedActionStatus',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: 'https://api.example.com/review',
              encodingType: 'application/ld+json',
              contentType: 'application/ld+json'
            },
            object: {
              '@type': 'Movie',
              url: 'http://example.com/movies/123',
              'url-input': 'required'
            },
            result: {
              '@type': 'Review',
              url: 'http://example.com/reviews/abc',
              'url-output': 'required',
              reviewBody: 'yada, yada, yada',
              'reviewBody-input': 'required',
              reviewRating: {
                ratingValue: '4',
                'ratingValue-input': 'required'
              }
            }
          }));
      });
    });
  });
});
