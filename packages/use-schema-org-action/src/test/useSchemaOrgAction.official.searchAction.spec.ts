/** @jest-environment ./src/test/HappyDOMEnvironmentWithWritableStream.js */

import { act } from 'react';
import { parseTemplate } from 'url-template';

import { type PropertyValueSpecification } from '../PropertyValueSpecificationSchema';
import useSchemaOrgAction, { type ActionHandler } from '../useSchemaOrgAction';
import variableMapToNullableStringRecord from '../variableMapToNullableStringRecord';
import { type MockOf } from './MockOf';
import renderHook, { type RenderHookResult } from './renderHook';

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

describe('Spec: Text search deep link with -input', () => {
  let webSite: WebSite;
  let handler: MockOf<ActionHandler>;

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

    handler = jest.fn().mockResolvedValueOnce({});
  });

  describe('when useSchemaOrgAction() is rendered', () => {
    let renderResult: RenderHookResult<ReturnType<typeof useSchemaOrgAction<SearchAction>>>;

    beforeEach(() => {
      renderResult = renderHook(() => useSchemaOrgAction<SearchAction>(webSite.potentialAction, handler));
    });

    test('should set "actionStatus" to "PotentialActionStatus"', () =>
      expect(renderResult.result.current[0]).toEqual({ actionStatus: 'PotentialActionStatus' }));

    test('should return "inputValidity.valid" of false', () =>
      expect(renderResult.result.current[2]).toHaveProperty('inputValidity.valid', false));

    describe('when setting the input value', () => {
      beforeEach(() => act(() => renderResult.result.current[1](action => ({ ...action, query: 'the search' }))));

      test('should merge input', () =>
        expect(renderResult.result.current[0]).toEqual({
          actionStatus: 'PotentialActionStatus',
          query: 'the search'
        }));

      test('should return "inputValidity.valid" of true', () =>
        expect(renderResult.result.current[2]).toHaveProperty('inputValidity.valid', true));

      describe('when submit() is called', () => {
        beforeEach(() => act(() => renderResult.result.current[2].perform()));

        test('should have called handler() once', () => expect(handler).toHaveBeenCalledTimes(1));

        // [NOT-IN-SPEC]
        test('should build request without constraints', () =>
          expect(handler.mock.lastCall?.[0]).toEqual({ query: 'the search' }));

        // [FROM-SPEC]
        test('should construct the input variables', () =>
          expect(Array.from(handler.mock.lastCall?.[1].entries() || [])).toEqual([['q', 'the search']]));

        // [FROM-SPEC]
        test('should expand URL template', () => {
          const template = parseTemplate(webSite.potentialAction.target);

          const inputVariables = handler.mock.lastCall?.[1];

          const url = template.expand(variableMapToNullableStringRecord(inputVariables || new Map()));

          // Spec is http://example.com/search?q=the+search
          // Actual is http://example.com/search?q=the%20search
          expect(url).toBe('http://example.com/search?q=the%20search');
        });
      });
    });
  });
});
