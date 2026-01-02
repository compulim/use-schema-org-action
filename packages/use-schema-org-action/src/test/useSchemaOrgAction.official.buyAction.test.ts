import { renderHook, type RenderHookResult } from '@compulim/test-harness/renderHook';
import { act } from '@testing-library/react';
import { expect } from 'expect';
import { beforeEach, describe, mock, test } from 'node:test';
import { type PropertyValueSpecification } from '../PropertyValueSpecificationSchema.ts';
import useSchemaOrgAction, { type ActionHandler } from '../useSchemaOrgAction.ts';
import type { MockOf } from './MockOf.ts';
import sortEntries from './sortEntries.ts';

type BuyAction = {
  '@type': 'BuyAction';
  object?: string | undefined;
  'object-output': PropertyValueSpecification;
  target: {
    '@type': 'EntryPoint';
    urlTemplate: string;
    encodingType: string;
    contentType: string;
  };
  result: {
    '@type': 'Order';
    url?: string | undefined;
    'url-output': PropertyValueSpecification;
    confirmationNumber?: string | undefined;
    'confirmationNumber-output': PropertyValueSpecification;
    orderNumber?: string | undefined;
    'orderNumber-output': PropertyValueSpecification;
    orderStatus?: string | undefined;
    'orderStatus-output': PropertyValueSpecification;
  };
};

type Product = {
  '@type': 'Product';
  url: string;
  potentialAction: BuyAction;
};

describe('Spec: Product purchase API call with -output', () => {
  let product: Product;
  let handler: MockOf<ActionHandler>;

  beforeEach(() => {
    // [FROM-SPEC]
    product = {
      '@type': 'Product',
      url: 'http://example.com/products/ipod',
      potentialAction: {
        '@type': 'BuyAction',
        'object-output': 'required',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: 'https://example.com/products/ipod/buy',
          encodingType: 'application/ld+json',
          contentType: 'application/ld+json'
        },
        result: {
          '@type': 'Order',
          'url-output': 'name=url required',
          'confirmationNumber-output': 'name=confirmationNumber required',
          'orderNumber-output': 'name=orderNumber required',
          'orderStatus-output': 'name=orderStatus required'
        }
      }
    };

    handler = mock.fn();
  });

  describe('when useSchemaOrgAction() is rendered', () => {
    let renderResult: RenderHookResult<ReturnType<typeof useSchemaOrgAction<BuyAction>>>;

    beforeEach(() => {
      renderResult = renderHook(() => useSchemaOrgAction<BuyAction>(product.potentialAction, handler));
    });

    describe('when submit() is called', () => {
      beforeEach(async () => {
        // [FROM-SPEC]
        handler.mock.mockImplementationOnce(() =>
          Promise.resolve({
            '@type': 'BuyAction',
            actionStatus: 'CompletedActionStatus',
            object: 'https://example.com/products/ipod',
            result: {
              '@type': 'Order',
              url: 'http://example.com/orders/1199334',
              confirmationNumber: '1ABBCDDF23234',
              orderNumber: '1199334',
              orderStatus: 'PROCESSING'
            }
          })
        );

        await act(() => renderResult.result.current[2].perform());
      });

      test('should have called handler() once', () => expect(handler.mock.callCount()).toBe(1));

      test('should have called with empty request', () =>
        expect(handler.mock.calls[0]?.arguments[0]).toStrictEqual({}));

      test('should have called with empty input variables', () =>
        expect(sortEntries(handler.mock.calls[0]?.arguments[1].entries() || [])).toEqual([]));

      // [FROM-SPEC]
      test('should have called with URL', () =>
        expect(product.potentialAction.target.urlTemplate).toBe('https://example.com/products/ipod/buy'));

      // [NOT-IN-SPEC]
      test('should merge response into action', () =>
        expect(renderResult.result.current[0]).toStrictEqual({
          actionStatus: 'CompletedActionStatus',
          object: 'https://example.com/products/ipod',
          result: {
            url: 'http://example.com/orders/1199334',
            confirmationNumber: '1ABBCDDF23234',
            orderNumber: '1199334',
            orderStatus: 'PROCESSING'
          }
        }));
    });
  });
});
