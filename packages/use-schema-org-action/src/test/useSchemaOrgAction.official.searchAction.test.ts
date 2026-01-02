import { cleanup, renderHook, type RenderHookResult } from '@compulim/test-harness/renderHook';
import { act } from '@testing-library/react';
import { expect } from 'expect';
import { afterEach, beforeEach, describe, mock, test, type Mock } from 'node:test';
import { parseTemplate } from 'url-template';
import { type PropertyValueSpecification } from '../PropertyValueSpecificationSchema.ts';
import useSchemaOrgAction, { type ActionHandler } from '../useSchemaOrgAction.ts';
import variableMapToNullableStringRecord from '../variableMapToNullableStringRecord.ts';

type SearchAction = {
  '@type': 'SearchAction';
  target: string;
  query?: string | undefined;
  'query-input': PropertyValueSpecification;
};

type WebSite = {
  '@context': 'https://schema.org';
  '@type': 'WebSite';
  name: string;
  potentialAction: SearchAction;
};

afterEach(cleanup);

describe('Spec: Text search deep link with -input', () => {
  let webSite: WebSite;
  let handler: Mock<ActionHandler>;

  beforeEach(() => {
    // [FROM-SPEC]
    webSite = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Example.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'http://example.com/search?q={q}',
        'query-input': 'required maxlength=100 name=q'
      }
    };

    handler = mock.fn<ActionHandler>();
    handler.mock.mockImplementationOnce(() => Promise.resolve({}));
  });

  describe('when useSchemaOrgAction() is rendered', () => {
    let renderResult: RenderHookResult<ReturnType<typeof useSchemaOrgAction<SearchAction>>>;

    beforeEach(() => {
      renderResult = renderHook(() => useSchemaOrgAction<SearchAction>(webSite.potentialAction, handler));
    });

    test('should set "actionStatus" to "PotentialActionStatus"', () =>
      expect(renderResult.result.current[0]).toStrictEqual({
        actionStatus: 'PotentialActionStatus',
        query: undefined
      }));

    test('should return "inputValidity.valid" of false', () =>
      expect(renderResult.result.current[2]).toHaveProperty('inputValidity.valid', false));

    describe('when setting the input value', () => {
      beforeEach(() =>
        act(() => renderResult.result.current[1](actionState => ({ ...actionState, query: 'the search' })))
      );

      test('should merge input', () =>
        expect(renderResult.result.current[0]).toStrictEqual({
          actionStatus: 'PotentialActionStatus',
          query: 'the search'
        }));

      test('should return "inputValidity.valid" of true', () =>
        expect(renderResult.result.current[2]).toHaveProperty('inputValidity.valid', true));

      describe('when submit() is called', () => {
        beforeEach(() => act(() => renderResult.result.current[2].perform()));

        test('should have called handler() once', () => expect(handler.mock.callCount()).toBe(1));

        // [NOT-IN-SPEC]
        test('should build request without constraints', () =>
          expect(handler.mock.calls.at(-1)?.arguments[0]).toStrictEqual({ query: 'the search' }));

        // [FROM-SPEC]
        test('should construct the input variables', () =>
          expect(Array.from(handler.mock.calls.at(-1)?.arguments[1]?.entries() || [])).toEqual([['q', 'the search']]));

        // [FROM-SPEC]
        test('should expand URL template', () => {
          const template = parseTemplate(webSite.potentialAction.target);

          const inputVariables = handler.mock.calls.at(-1)?.arguments[1];

          const url = template.expand(variableMapToNullableStringRecord(inputVariables || new Map()));

          // Spec is http://example.com/search?q=the+search
          // Actual is http://example.com/search?q=the%20search
          expect(url).toBe('http://example.com/search?q=the%20search');
        });
      });
    });
  });
});
