/** @jest-environment ./src/test/HappyDOMEnvironmentWithWritableStream.js */

import { act } from '@testing-library/react';
import { type PropertyValueSpecification } from '../PropertyValueSpecificationSchema';
import useSchemaOrgAction, { type ActionHandler } from '../useSchemaOrgAction';
import { type MockOf } from './MockOf';
import renderHook, { type RenderHookResult } from './renderHook';

type SearchAction = {
  '@type': 'SearchAction';
  'actionStatus-output'?: PropertyValueSpecification | undefined;
  target: string;
  query?: string | undefined;
  'query-input': PropertyValueSpecification;
};

let searchAction: SearchAction;

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
  let handler: MockOf<ActionHandler>;
  let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult, void>;

  beforeEach(async () => {
    handler = jest.fn();
    renderResult = renderHook(() =>
      useSchemaOrgAction<SearchAction>({ ...searchAction, 'actionStatus-output': '' }, handler)
    );
  });

  describe('when called and response has a valid "actionStatus"', () => {
    let promise: Promise<void>;

    beforeEach(async () => {
      handler.mockImplementation((_input, _request, _option) =>
        Promise.resolve({
          actionStatus: 'FailedActionStatus',
          result: { url: 'https://example.com/output' }
        })
      );

      return act(() => {
        promise = renderResult.result.current[2].perform();

        return promise.catch(() => {});
      });
    });

    test('should not throw', () => expect(promise).resolves.toBeUndefined());

    test('should override "actionStatus" property', () =>
      expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'FailedActionStatus'));
  });

  describe('when called and response has an invalid "actionStatus"', () => {
    let promise: Promise<void>;

    beforeEach(() => {
      handler.mockImplementation((_input, _request, _option) =>
        Promise.resolve({
          actionStatus: '<INVALID>',
          result: { url: 'https://example.com/output' }
        })
      );

      return act(() => {
        promise = renderResult.result.current[2].perform();

        return promise.catch(() => {});
      });
    });

    test('should throw', () => expect(promise).rejects.toThrow());

    test('should set "actionStatus" property to "FailedActionStatus"', () =>
      expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'FailedActionStatus'));
  });
});

describe('an action where "actionStatus-output" is not set', () => {
  let handler: MockOf<ActionHandler>;
  let renderResult: RenderHookResult<UseSchemaOrgActionForReviewActionResult, void>;

  beforeEach(async () => {
    handler = jest.fn();
    renderResult = renderHook(() => useSchemaOrgAction<SearchAction>(searchAction, handler));
  });

  describe('when called and response has a valid "actionStatus"', () => {
    let promise: Promise<void>;

    beforeEach(async () => {
      handler.mockImplementation((_input, _request, _option) =>
        Promise.resolve({
          actionStatus: 'FailedActionStatus',
          result: { url: 'https://example.com/output' }
        })
      );

      return act(() => {
        promise = renderResult.result.current[2].perform();

        return promise.catch(() => {});
      });
    });

    test('should not throw', () => expect(promise).resolves.toBeUndefined());

    test('should not override "actionStatus" property', () =>
      expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'CompletedActionStatus'));
  });

  describe('when called and response has an invalid "actionStatus"', () => {
    let promise: Promise<void>;

    beforeEach(async () => {
      handler.mockImplementation((_input, _request, _option) =>
        Promise.resolve({
          actionStatus: '<INVALID>',
          result: { url: 'https://example.com/output' }
        })
      );

      return act(() => {
        promise = renderResult.result.current[2].perform();

        return promise.catch(() => {});
      });
    });

    test('should not throw', () => expect(promise).resolves.toBeUndefined());

    test('should not override "actionStatus" property', () =>
      expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'CompletedActionStatus'));
  });
});
