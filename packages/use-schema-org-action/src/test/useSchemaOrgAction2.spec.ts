/** @jest-environment ./src/test/jsdomEnvironmentWithWritableStream.js */

import { act } from '@testing-library/react';

import { type ActionStatusType } from '../ActionStatusType';
import { type PropertyValueSpecification } from '../PropertyValueSpecificationSchema';
import useSchemaOrgAction from '../useSchemaOrgAction2';
import { type VariableMap } from '../VariableMap';
import renderHook, { type RenderHookResult } from './renderHook';

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
      url: 'https://example.com/input',
      'url-input': 'name=url required'
    },
    result: {
      '@type': 'Review',
      'url-output': { valueMinLength: 10, valueName: 'url', valueRequired: true },
      'reviewBody-input': { valueName: 'review', valueRequired: true },
      reviewRating: {
        ratingValue: -1,
        'ratingValue-input': { minValue: 0, maxValue: 5, valueName: 'rating', valueRequired: true }
      }
    }
  };
});

type UseSchemaOrgActionForReviewActionResult = ReturnType<typeof useSchemaOrgAction<ReviewAction>>;

describe('when rendered initially', () => {
  let handler: jest.Mock<Promise<VariableMap>, [VariableMap, Readonly<{ signal: AbortSignal }>]>;
  let handlerResolvers: PromiseWithResolvers<VariableMap>;
  let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult, void>;

  beforeEach(() => {
    handlerResolvers = Promise.withResolvers();

    handler = jest.fn<Promise<VariableMap>, [VariableMap, Readonly<{ signal: AbortSignal }>]>(
      () => handlerResolvers.promise
    );

    renderResult = renderHook(() => useSchemaOrgAction(reviewAction, handler));
  });

  test('should return action with actionStatus of "potentialActionStatus"', () =>
    expect(renderResult.result.current[2]).toHaveProperty('action', {
      actionStatus: 'PotentialActionStatus',
      ...reviewAction
    }));

  test('should extract existing input including invalid input', () =>
    expect(renderResult.result.current[0]).toEqual(
      new Map<string, boolean | Date | number | string | undefined>([
        ['rating', -1],
        ['url', 'https://example.com/input']
      ])
    ));

  test('isInputValid should be false', () => expect(renderResult.result.current[2].isInputValid).toBe(false));

  describe('when input is set to a valid value', () => {
    beforeEach(() =>
      act(() =>
        renderResult.result.current[1](
          new Map<string, boolean | Date | number | string | undefined>([
            ['rating', 5],
            ['review', 'Great movie.'],
            ['url', 'https://example.com/input']
          ])
        )
      )
    );

    test('input should contain value', () =>
      expect(renderResult.result.current[0]).toEqual(
        new Map<string, boolean | Date | number | string | undefined>([
          ['rating', 5],
          ['review', 'Great movie.'],
          ['url', 'https://example.com/input']
        ])
      ));

    test('action should contain value', () =>
      expect(renderResult.result.current[2]).toHaveProperty('action', {
        ...reviewAction,
        actionStatus: 'PotentialActionStatus',
        object: {
          ...reviewAction.object,
          url: 'https://example.com/input'
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

    describe('when submit() is called', () => {
      let submitPromise: Promise<void>;

      beforeEach(() =>
        act(() => {
          submitPromise = renderResult.result.current[2].submit();
          submitPromise.catch(() => {});
        })
      );

      describe('should call handler()', () => {
        test('once', () => expect(handler).toHaveBeenCalledTimes(1));

        test('with correct type of arguments', () =>
          expect(handler).toHaveBeenNthCalledWith(
            1,
            expect.any(Map),
            expect.objectContaining({
              signal: expect.any(AbortSignal)
            })
          ));

        test('with input', () =>
          expect(Array.from(handler.mock.calls[0]?.[0].entries() || [])).toEqual([
            ['rating', 5],
            ['review', 'Great movie.'],
            ['url', 'https://example.com/input']
          ]));

        test('with unaborted signal', () => expect(handler.mock.calls[0]?.[1].signal).toHaveProperty('aborted', false));

        test('with input merged into action with "actionStatus" property of "ActiveActionStatus"', () => {
          expect(renderResult.result.current[2]).toHaveProperty('action', {
            ...reviewAction,
            actionStatus: 'ActiveActionStatus',
            object: {
              ...reviewAction.object,
              url: 'https://example.com/input'
            },
            result: {
              ...reviewAction.result,
              reviewBody: 'Great movie.',
              reviewRating: {
                ...reviewAction.result?.reviewRating,
                ratingValue: 5
              }
            }
          });
        });

        describe('when handler() is resolved with valid output', () => {
          beforeEach(() =>
            act(() => {
              handlerResolvers.resolve(new Map([['url', 'https://example.com/output']]));

              return submitPromise;
            })
          );

          test('should merge output into action and mark as completed', () => {
            expect(renderResult.result.current[2]).toHaveProperty('action', {
              ...reviewAction,
              actionStatus: 'CompletedActionStatus',
              object: {
                ...reviewAction.object,
                url: 'https://example.com/input'
              },
              result: {
                ...reviewAction.result,
                reviewBody: 'Great movie.',
                reviewRating: {
                  ...reviewAction.result?.reviewRating,
                  ratingValue: 5
                },
                url: 'https://example.com/output'
              }
            });
          });
        });

        describe('when handler() is resolved with invalid output', () => {
          beforeEach(() => act(() => handlerResolvers.resolve(new Map([['url', 'too-short']]))));

          test('should throw', () => expect(submitPromise).rejects.toThrow());
        });

        describe('when handler() is resolved after unmount', () => {
          beforeEach(() =>
            act(() => {
              renderResult.unmount();
              handlerResolvers.resolve(new Map([['url', 'https://example.com/output']]));

              return submitPromise;
            })
          );

          test('should not merge output into action', () =>
            expect(renderResult.result.current[2]).toHaveProperty('action', {
              ...reviewAction,
              actionStatus: 'ActiveActionStatus',
              object: {
                ...reviewAction.object,
                url: 'https://example.com/input'
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
      });
    });

    test('isInputValid should be true', () => expect(renderResult.result.current[2].isInputValid).toBe(true));
  });

  describe('when input is set to an invalid value', () => {
    beforeEach(() =>
      act(() =>
        renderResult.result.current[1](
          new Map<string, boolean | Date | number | string | undefined>([
            ['rating', -1],
            ['review', 'Great movie.'],
            ['url', 'https://example.com/input']
          ])
        )
      )
    );

    test('input should contain value', () =>
      expect(Array.from(renderResult.result.current[0].entries?.() || [])).toEqual([
        ['rating', -1],
        ['review', 'Great movie.'],
        ['url', 'https://example.com/input']
      ]));

    test('action should contain invalid value', () => {
      expect(renderResult.result.current[2]).toHaveProperty('action', {
        ...reviewAction,
        actionStatus: 'PotentialActionStatus',
        object: {
          ...reviewAction.object,
          url: 'https://example.com/input'
        },
        result: {
          ...reviewAction.result,
          reviewBody: 'Great movie.',
          reviewRating: {
            ...reviewAction.result?.reviewRating,
            ratingValue: -1
          }
        }
      });
    });

    test('when submit() is called should reject', async () => {
      let submitPromise: Promise<void> | undefined;

      act(() => {
        submitPromise = renderResult.result.current[2].submit();
        submitPromise.catch(() => {});
      });

      await expect(submitPromise).rejects.toThrow();
    });

    test('isInputValid should be false', () => expect(renderResult.result.current[2].isInputValid).toBe(false));
  });
});

describe('when rendered with initialAction containing valid "actionStatus" property', () => {
  let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult>;

  beforeEach(() => {
    renderResult = renderHook(() =>
      useSchemaOrgAction({ ...reviewAction, actionStatus: 'CompletedActionStatus' }, jest.fn())
    );
  });

  test('should use the initial value', () =>
    expect(renderResult.result.current[2].action).toEqual({ ...reviewAction, actionStatus: 'CompletedActionStatus' }));
});

describe('when rendered with initialAction containing invalid "actionStatus" property', () => {
  let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult>;

  beforeEach(() => {
    renderResult = renderHook(() => useSchemaOrgAction({ ...reviewAction, actionStatus: '123' }, jest.fn()));
  });

  test('should replace with "PotentialActionStatus"', () =>
    expect(renderResult.result.current[2].action).toEqual({ ...reviewAction, actionStatus: 'PotentialActionStatus' }));
});
