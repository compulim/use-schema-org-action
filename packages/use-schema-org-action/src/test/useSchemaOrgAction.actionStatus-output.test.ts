import { cleanup, renderHook, type RenderHookResult } from '@compulim/test-harness/renderHook';
import { act } from '@testing-library/react';
import { expect } from 'expect';
import { afterEach, beforeEach, describe, mock, test, type Mock } from 'node:test';
import { type PropertyValueSpecification } from '../PropertyValueSpecificationSchema.ts';
import useSchemaOrgAction, { type ActionHandler } from '../useSchemaOrgAction.ts';

type SearchAction = {
  '@type': 'SearchAction';
  'actionStatus-output'?: PropertyValueSpecification | undefined;
  target: string;
  query?: string | undefined;
  'query-input': PropertyValueSpecification;
};

let searchAction: SearchAction;

afterEach(cleanup);

beforeEach(() => {
  // [MODIFIED-FROM-SPEC]
  searchAction = {
    '@type': 'SearchAction',
    target: 'http://example.com/search?q={q}',
    query: 'test',
    'query-input': 'required maxlength=100 name=q'
  };
});

type UseSchemaOrgActionForReviewActionResult = ReturnType<typeof useSchemaOrgAction<SearchAction>>;

describe('an action where "actionStatus-output" is set', () => {
  let handler: Mock<ActionHandler>;
  let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult, void>;

  beforeEach(async () => {
    handler = mock.fn();
    renderResult = renderHook(() =>
      useSchemaOrgAction<SearchAction>({ ...searchAction, 'actionStatus-output': '' }, handler)
    );
  });

  describe('when called and response has a valid "actionStatus"', () => {
    let promise: Promise<void>;

    beforeEach(async () => {
      handler.mock.mockImplementation((_input: unknown, _request: unknown, _option: unknown) =>
        Promise.resolve({
          actionStatus: 'FailedActionStatus',
          result: { url: 'https://example.com/output' }
        })
      );

      act(() => {
        promise = renderResult.result.current[2].perform();

        promise.catch(() => {});
      });
    });

    test('should not throw', () => expect(promise).resolves.toBeUndefined());

    test('should override "actionStatus" property', () =>
      expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'FailedActionStatus'));
  });

  describe('when called and response has an invalid "actionStatus"', () => {
    let promise: Promise<void>;

    beforeEach(() => {
      handler.mock.mockImplementation((_input: unknown, _request: unknown, _option: unknown) =>
        Promise.resolve({
          actionStatus: '<INVALID>',
          result: { url: 'https://example.com/output' }
        })
      );

      act(() => {
        promise = renderResult.result.current[2].perform();

        promise.catch(() => {});
      });
    });

    test('should throw', () => expect(promise).rejects.toThrow());

    test('should set "actionStatus" property to "FailedActionStatus"', () =>
      expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'FailedActionStatus'));
  });
});

describe('an action where "actionStatus-output" is not set', () => {
  let handler: Mock<ActionHandler>;
  let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult, void>;

  beforeEach(async () => {
    handler = mock.fn();
    renderResult = renderHook(() => useSchemaOrgAction<SearchAction>(searchAction, handler));
  });

  describe('when called and response has a valid "actionStatus"', () => {
    let promise: Promise<void>;

    beforeEach(async () => {
      handler.mock.mockImplementation((_input: unknown, _request: unknown, _option: unknown) =>
        Promise.resolve({
          actionStatus: 'FailedActionStatus',
          result: { url: 'https://example.com/output' }
        })
      );

      act(() => {
        promise = renderResult.result.current[2].perform();

        promise.catch(() => {});
      });
    });

    test('should not throw', () => {
      expect(promise).resolves.toBeUndefined();
    });

    test('should not override "actionStatus" property', () =>
      expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'CompletedActionStatus'));
  });

  describe('when called and response has an invalid "actionStatus"', () => {
    let promise: Promise<void>;

    beforeEach(async () => {
      handler.mock.mockImplementation((_input: unknown, _request: unknown, _option: unknown) =>
        Promise.resolve({
          actionStatus: '<INVALID>',
          result: { url: 'https://example.com/output' }
        })
      );

      act(() => {
        promise = renderResult.result.current[2].perform();

        promise.catch(() => {});
      });
    });

    test('should not throw', () => expect(promise).resolves.toBeUndefined());

    test('should not override "actionStatus" property', () =>
      expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'CompletedActionStatus'));
  });
});
