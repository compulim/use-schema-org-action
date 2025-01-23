/** @jest-environment ./src/test/JSDOMEnvironmentWithWritableStream.js */

import { act } from '@testing-library/react';
import { type PartialDeep } from 'type-fest';
import { type ActionStatusType } from '../ActionStatusType';
import { type PropertyValueSpecification } from '../PropertyValueSpecificationSchema';
import useSchemaOrgAction, { type ActionHandler } from '../useSchemaOrgAction2';
import { type MockOf } from './MockOf';
import renderHook, { type RenderHookResult } from './renderHook';
import sortEntries from './sortEntries';

type ReviewAction = {
  '@context'?: 'https://schema.org';
  '@type'?: 'ReviewAction';
  actionStatus?: ActionStatusType;
  'actionStatus-output'?: PropertyValueSpecification;
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

let reviewAction: ReviewAction;

beforeEach(() => {
  // [MODIFIED-FROM-SPEC]
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
      'url-output': { valueMinLength: 10, valueRequired: true },
      'reviewBody-input': { valueName: 'review', valueRequired: true },
      reviewRating: {
        'ratingValue-input': { minValue: 0, maxValue: 5, valueName: 'rating', valueRequired: true }
      }
    }
  };
});

type UseSchemaOrgActionForReviewActionResult = ReturnType<typeof useSchemaOrgAction<ReviewAction>>;

describe('when rendered initially', () => {
  let handler: MockOf<ActionHandler>;
  let handlerResolvers: PromiseWithResolvers<PartialDeep<ReviewAction>>;
  let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult, void>;

  beforeEach(() => {
    handlerResolvers = Promise.withResolvers();

    handler = jest.fn().mockReturnValueOnce(handlerResolvers.promise);

    renderResult = renderHook(() => useSchemaOrgAction(reviewAction, handler));
  });

  test('should return action with actionStatus of "PotentialActionStatus"', () =>
    expect(renderResult.result.current[0]).toEqual({
      actionStatus: 'PotentialActionStatus'
    }));

  test('"inputValidity.valid" should be false', () =>
    expect(renderResult.result.current[2]).toHaveProperty('inputValidity.valid', false));

  describe('when inputs are set to valid values', () => {
    beforeEach(() =>
      act(() =>
        renderResult.result.current[1](action => ({
          ...action,
          object: { url: 'https://example.com/input' },
          result: {
            reviewBody: 'Great movie.',
            reviewRating: { ratingValue: 5 }
          }
        }))
      )
    );

    test('input should contain value', () =>
      expect(renderResult.result.current[2]).toHaveProperty(
        'inputVariables',
        new Map<string, boolean | Date | number | string | undefined>([
          ['rating', 5],
          ['review', 'Great movie.'],
          ['url', 'https://example.com/input']
        ])
      ));

    test('actionState should contain value', () =>
      expect(renderResult.result.current[0]).toEqual({
        actionStatus: 'PotentialActionStatus',
        object: {
          url: 'https://example.com/input'
        },
        result: {
          reviewBody: 'Great movie.',
          reviewRating: {
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
            expect.any(Object),
            expect.any(Map),
            expect.objectContaining({
              signal: expect.any(AbortSignal)
            })
          ));

        test('with request only marked by input constraints', () =>
          // [NOT-IN-SPEC]
          expect(handler.mock.calls[0]?.[0]).toEqual({
            object: {
              url: 'https://example.com/input'
            },
            result: {
              reviewBody: 'Great movie.',
              reviewRating: {
                ratingValue: 5
              }
            }
          }));

        test('with input variables', () =>
          expect(sortEntries(handler.mock.calls[0]?.[1].entries() || [])).toEqual([
            ['rating', 5],
            ['review', 'Great movie.'],
            ['url', 'https://example.com/input']
          ]));

        test('with unaborted signal', () => expect(handler.mock.calls[0]?.[2].signal).toHaveProperty('aborted', false));

        test('with "actionStatus" property of "ActiveActionStatus"', () => {
          expect(renderResult.result.current[0]).toEqual({
            actionStatus: 'ActiveActionStatus',
            object: {
              url: 'https://example.com/input'
            },
            result: {
              reviewBody: 'Great movie.',
              reviewRating: {
                ratingValue: 5
              }
            }
          });
        });

        describe('when handler() is resolved with valid output', () => {
          beforeEach(() =>
            act(() => {
              handlerResolvers.resolve({ result: { url: 'https://example.com/output' } });

              return submitPromise;
            })
          );

          test('should merge output into action and mark as completed', () => {
            expect(renderResult.result.current[0]).toEqual({
              actionStatus: 'CompletedActionStatus',
              object: {
                url: 'https://example.com/input'
              },
              result: {
                reviewBody: 'Great movie.',
                reviewRating: {
                  ratingValue: 5
                },
                url: 'https://example.com/output'
              }
            });
          });
        });

        describe('when handler() is resolved with invalid output', () => {
          beforeEach(() => act(() => handlerResolvers.resolve({ result: { url: 'too-short' } })));

          test('should throw', () => expect(submitPromise).rejects.toThrow());

          test('should have "actionStatus" set to "FailedActionStatus"', () =>
            expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'FailedActionStatus'));
        });

        describe('when handler() is resolved after unmount', () => {
          beforeEach(() =>
            act(() => {
              renderResult.unmount();
              handlerResolvers.resolve({ result: { url: 'https://example.com/output' } });

              return submitPromise;
            })
          );

          test('should not merge output into action', () =>
            expect(renderResult.result.current[0]).toEqual({
              actionStatus: 'ActiveActionStatus',
              object: {
                url: 'https://example.com/input'
              },
              result: {
                reviewBody: 'Great movie.',
                reviewRating: {
                  ratingValue: 5
                }
              }
            }));
        });

        describe('when handler() is rejected after unmount', () => {
          beforeEach(() =>
            act(() => {
              renderResult.unmount();
              handlerResolvers.resolve({ result: { url: 'too-short' } });
            })
          );

          test('should throw', () => expect(submitPromise).rejects.toThrow());

          test('should keep "actionStatus" with "ActiveActionStatus"', () =>
            expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'ActiveActionStatus'));
        });
      });
    });

    test('"inputValidity.valid" should be true', () =>
      expect(renderResult.result.current[2]).toHaveProperty('inputValidity.valid', true));
  });

  describe('when input is set to an invalid value', () => {
    beforeEach(() =>
      act(() =>
        renderResult.result.current[1](action => ({
          ...action,
          object: { url: 'https://example.com/input' },
          result: {
            reviewBody: 'Great movie.',
            reviewRating: { ratingValue: -1 }
          }
        }))
      )
    );

    test('input should contain invalid value', () =>
      expect(sortEntries(renderResult.result.current[2].inputVariables.entries?.() || [])).toEqual([
        ['rating', -1],
        ['review', 'Great movie.'],
        ['url', 'https://example.com/input']
      ]));

    test('action should contain invalid value', () => {
      expect(renderResult.result.current[0]).toEqual({
        actionStatus: 'PotentialActionStatus',
        object: {
          url: 'https://example.com/input'
        },
        result: {
          reviewBody: 'Great movie.',
          reviewRating: {
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

      await expect(submitPromise).rejects.toThrow('Input is invalid, cannot submit.');
    });

    test('"inputValidity.valid" should be false', () =>
      expect(renderResult.result.current[2]).toHaveProperty('inputValidity.valid', false));
  });

  describe('when updating action', () => {
    let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult>;

    beforeEach(async () => {
      renderResult = renderHook(() => useSchemaOrgAction<ReviewAction>(reviewAction, handler));

      await act(() =>
        renderResult.result.current[1](actionState => ({
          ...actionState,
          object: { url: 'https://example.com/input-1' }
        }))
      );

      await act(() =>
        renderResult.result.current[1](actionState => ({
          ...actionState,
          object: { url: 'https://example.com/input-2' }
        }))
      );
    });

    test('should have action updated', () =>
      expect(renderResult.result.current[0]).toEqual({
        actionStatus: 'PotentialActionStatus',
        object: { url: 'https://example.com/input-2' }
      }));

    describe('when submit() is called', () => {
      beforeEach(async () => {
        await act(() => {
          renderResult.result.current[1](reviewAction => ({
            ...reviewAction,
            result: {
              reviewBody: 'Great movie.',
              reviewRating: { ratingValue: 5 }
            }
          }));
        });

        await act(() => {
          // Do not resolve the promise.
          renderResult.result.current[2].submit();
        });
      });

      test('should call handler with updated request', () => {
        // [NOT-IN-SPEC]
        expect(handler.mock.calls[0]?.[0]).toEqual({
          object: { url: 'https://example.com/input-2' },
          result: {
            reviewBody: 'Great movie.',
            reviewRating: { ratingValue: 5 }
          }
        });
      });

      test('should call handler with updated input variables', () => {
        expect(sortEntries(handler.mock.calls[0]?.[1]?.entries() || [])).toEqual([
          ['rating', 5],
          ['review', 'Great movie.'],
          ['url', 'https://example.com/input-2']
        ]);
      });
    });
  });
});

describe('when rendered with initialAction containing valid "actionStatus" property', () => {
  let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult>;

  beforeEach(() => {
    renderResult = renderHook(() =>
      useSchemaOrgAction<ReviewAction>({ ...reviewAction, actionStatus: 'CompletedActionStatus' }, jest.fn())
    );
  });

  test('should use the initial value', () =>
    expect(renderResult.result.current[0]).toEqual({ actionStatus: 'CompletedActionStatus' }));
});

describe('when rendered with initialAction containing invalid "actionStatus" property', () => {
  let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult>;

  beforeEach(() => {
    renderResult = renderHook(() =>
      // Explicitly set an invalid value.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      useSchemaOrgAction<ReviewAction>({ ...reviewAction, actionStatus: '123' as any }, jest.fn())
    );
  });

  test('should replace with "PotentialActionStatus"', () =>
    expect(renderResult.result.current[0]).toEqual({ actionStatus: 'PotentialActionStatus' }));
});

describe('when call submit() with an action where "actionStatus-output" is set', () => {
  let handler: MockOf<ActionHandler>;
  let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult, void>;

  beforeEach(async () => {
    handler = jest.fn((_input, _request, _option) =>
      Promise.resolve({
        actionStatus: 'FailedActionStatus',
        result: { url: 'https://example.com/output' }
      })
    );

    renderResult = renderHook(() =>
      useSchemaOrgAction<ReviewAction>(
        {
          '@context': 'https://schema.org',
          '@type': 'ReviewAction',
          'actionStatus-output': {
            '@type': 'PropertyValueSpecification',
            valueName: 'status'
          },
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
            'url-output': { valueMinLength: 10, valueName: 'url', valueRequired: true },
            'reviewBody-input': { valueName: 'review', valueRequired: true },
            reviewRating: {
              'ratingValue-input': { minValue: 0, maxValue: 5, valueName: 'rating', valueRequired: true }
            }
          }
        } satisfies ReviewAction,
        handler
      )
    );

    await act(() =>
      renderResult.result.current[1](action => ({
        ...action,
        object: { url: 'https://example.com/input' },
        result: {
          reviewBody: 'Great movie.',
          reviewRating: { ratingValue: 5 }
        }
      }))
    );

    await act(() => renderResult.result.current[2].submit());
  });

  test('should override "actionStatus" property', () =>
    expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'FailedActionStatus'));
});

describe('when call submit() with an action where "actionStatus" is set to an invalid value', () => {
  let handler: MockOf<ActionHandler>;
  let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult, void>;
  let submitPromise: Promise<void>;

  beforeEach(async () => {
    handler = jest.fn((_input, _request, _option) =>
      Promise.resolve({
        actionStatus: 'invalid-value',
        result: { url: 'https://example.com/output' }
        // Explicitly set to an invalid value.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any)
    );

    renderResult = renderHook(() =>
      useSchemaOrgAction<ReviewAction>(
        {
          '@context': 'https://schema.org',
          '@type': 'ReviewAction',
          'actionStatus-output': {
            '@type': 'PropertyValueSpecification',
            valueName: 'status'
          },
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
            reviewBody: 'Great movie.',
            'reviewBody-input': { valueName: 'review', valueRequired: true },
            reviewRating: {
              ratingValue: 5,
              'ratingValue-input': { minValue: 0, maxValue: 5, valueName: 'rating', valueRequired: true }
            }
          }
        } satisfies ReviewAction,
        handler
      )
    );

    await act(() => {
      submitPromise = renderResult.result.current[2].submit();

      return submitPromise.catch(() => {});
    });
  });

  test('should throw', () => expect(submitPromise).rejects.toThrow());

  test('should have "actionStatus" set to "FailedActionStatus"', () =>
    expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'FailedActionStatus'));
});

describe('when called with initialActionState', () => {
  let handler: MockOf<ActionHandler>;
  let handlerResolvers: PromiseWithResolvers<PartialDeep<ReviewAction>>;
  let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult, void>;

  beforeEach(() => {
    handlerResolvers = Promise.withResolvers();

    handler = jest.fn().mockReturnValueOnce(handlerResolvers.promise);

    renderResult = renderHook(() =>
      useSchemaOrgAction(reviewAction, handler, {
        object: { url: 'https://example.com/input' },
        result: {
          reviewBody: 'Great movie.',
          reviewRating: { ratingValue: 5 }
        }
      })
    );
  });

  test('input should be valid', () =>
    expect(renderResult.result.current[2].inputValidity).toHaveProperty('valid', true));

  test('actionState should contain initialActionState', () =>
    expect(renderResult.result.current[0]).toEqual({
      actionStatus: 'PotentialActionStatus',
      object: { url: 'https://example.com/input' },
      result: {
        reviewBody: 'Great movie.',
        reviewRating: { ratingValue: 5 }
      }
    }));
});

test('initialActionState.actionStatus should be preferred over initialAction.actionStatus', () => {
  let handler: MockOf<ActionHandler>;
  let handlerResolvers: PromiseWithResolvers<PartialDeep<ReviewAction>>;
  let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult, void>;

  handlerResolvers = Promise.withResolvers();

  handler = jest.fn().mockReturnValueOnce(handlerResolvers.promise);

  renderResult = renderHook(() =>
    useSchemaOrgAction(
      {
        ...reviewAction,
        actionStatus: 'ActiveActionStatus'
      },
      handler,
      {
        actionStatus: 'CompletedActionStatus',
        object: { url: 'https://example.com/input' },
        result: {
          reviewBody: 'Great movie.',
          reviewRating: { ratingValue: 5 }
        }
      }
    )
  );

  expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'CompletedActionStatus');
});
