/** @jest-environment jsdom */

import { renderHook } from '@testing-library/react';

import { act } from 'react-dom/test-utils';
import { type ActionStatusType } from './ActionStatusType';
import { type PropertyValueSpecification } from './PropertyValueSpecificationSchema';
import useSchemaOrgAction from './useSchemaOrgAction';

test('Spec: Text search deep link with -input', async () => {
  type SearchAction = {
    '@context'?: 'https://schema.org';
    '@type'?: 'WebSite';
    name?: string;
    potentialAction?: {
      '@type'?: 'SearchAction';
      target?: string;
      query?: string;
      'query-input'?: PropertyValueSpecification;
    };
  };

  // SETUP: The action from the spec.
  const searchAction: SearchAction = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Example.com',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'http://example.com/search?q={q}',
      'query-input': 'required maxlength=100 name=q'
    }
  };

  const handler = jest.fn<
    Promise<Readonly<Partial<SearchAction>>>,
    [Readonly<Partial<SearchAction>>, ReadonlyMap<string, unknown>]
  >();

  // WHEN: Render the hook.
  const renderResult = renderHook(() => useSchemaOrgAction(searchAction, handler));

  // WHEN: Setting the input value.
  act(() =>
    renderResult.result.current[1](action => ({
      ...action,
      potentialAction: { query: 'the search' }
    }))
  );

  // WHEN: performAction() is called.
  await act(() => renderResult.result.current[2]());

  // THEN: It should construct the variables.
  expect(handler).toHaveBeenCalledTimes(1);
  expect(Array.from(handler.mock.lastCall?.[1].entries() || [])).toEqual([['q', 'the search']]);
});

test('Spec: Product purchase API call with -output', async () => {
  type BuyAction = {
    '@type'?: 'BuyAction';
    target?: {
      '@type'?: 'EntryPoint';
      urlTemplate?: string;
      encodingType?: string;
      contentType?: string;
    };
    result: {
      '@type'?: 'Order';
      url?: string;
      'url-output'?: PropertyValueSpecification;
      confirmationNumber?: string;
      'confirmationNumber-output'?: PropertyValueSpecification;
      orderNumber?: string;
      'orderNumber-output'?: PropertyValueSpecification;
      orderStatus?: string;
      'orderStatus-output'?: PropertyValueSpecification;
    };
  };

  type Product = {
    '@type'?: 'Product';
    url?: string;
    potentialAction?: BuyAction;
  };

  const product: Product & { potentialAction: BuyAction } = {
    '@type': 'Product',
    url: 'http://example.com/products/ipod',
    potentialAction: {
      '@type': 'BuyAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://example.com/products/ipod/buy',
        encodingType: 'application/ld+json',
        contentType: 'application/ld+json'
      },
      result: {
        '@type': 'Order',
        'url-output': 'required',
        'confirmationNumber-output': 'required',
        'orderNumber-output': 'required',
        'orderStatus-output': 'required'
      }
    }
  };

  const handler = jest.fn<
    Promise<Readonly<Partial<BuyAction>>>,
    [Readonly<Partial<BuyAction>>, ReadonlyMap<string, unknown>]
  >(() =>
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

  const renderResult = renderHook(() => useSchemaOrgAction(product.potentialAction, handler));

  // WHEN: performAction() is called.
  await act(() => renderResult.result.current[2]());

  // THEN: It should not throw as all output constraints are met.

  // THEN: [NOT-IN-SPEC] It should merge response into action.
  expect(renderResult.result.current[0]).toEqual({
    '@type': 'BuyAction',
    actionStatus: 'CompletedActionStatus',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://example.com/products/ipod/buy',
      encodingType: 'application/ld+json',
      contentType: 'application/ld+json'
    },
    result: {
      '@type': 'Order',
      url: 'http://example.com/orders/1199334',
      confirmationNumber: '1ABBCDDF23234',
      orderNumber: '1199334',
      orderStatus: 'PROCESSING'
    }
  });
});

test('Spec: Movie review site API with -input and -output', async () => {
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

  // SETUP: The action from the spec.
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

  const handler = jest.fn<
    Promise<Readonly<Partial<ReviewAction>>>,
    [Readonly<Partial<ReviewAction>>, ReadonlyMap<string, unknown>]
  >(() =>
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

  // WHEN: Render the hook.
  const renderResult = renderHook(() => useSchemaOrgAction(reviewAction, handler));

  // THEN: [NOT-IN-SPEC] Action should not have constraints.
  expect(renderResult.result.current[0]).toEqual({
    '@context': 'https://schema.org',
    '@type': 'ReviewAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: 'https://api.example.com/review',
      encodingType: 'application/ld+json',
      contentType: 'application/ld+json'
    },
    object: {
      '@type': 'Movie'
    },
    result: {
      '@type': 'Review',
      reviewRating: {}
    },
    actionStatus: 'PotentialActionStatus'
  });

  // WHEN: Setting action with required inputs.
  act(() =>
    renderResult.result.current[1](
      action =>
        ({
          ...action,
          object: { ...action.object, url: 'http://example.com/movies/123' },
          result: {
            ...action.result,
            reviewBody: 'yada, yada, yada',
            reviewRating: {
              ...action.result?.reviewRating,
              ratingValue: '4'
            }
          }
        }) satisfies ReviewAction
    )
  );

  // THEN: "isValid" become true.
  expect(renderResult.result.current[3]).toBe(true);

  // WHEN: performAction() is called.
  await act(() => renderResult.result.current[2]());

  expect(handler).toHaveBeenCalledTimes(1);
  expect(handler.mock.lastCall?.[0]).toEqual({
    '@context': 'https://schema.org',
    '@type': 'ReviewAction',
    object: {
      '@type': 'Movie',
      // The spec wrongly say this is @id instead of url.
      url: 'http://example.com/movies/123'
    },
    result: {
      '@type': 'Review',
      reviewBody: 'yada, yada, yada',
      reviewRating: {
        ratingValue: '4'
      }
    }
  });

  // THEN: [NOT-IN-SPEC] Should merge output into action.
  expect(renderResult.result.current[0]).toEqual({
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
      url: 'http://example.com/movies/123'
    },
    result: {
      '@type': 'Review',
      reviewBody: 'yada, yada, yada',
      reviewRating: {
        ratingValue: '4'
      },
      url: 'http://example.com/reviews/abc'
    },
    actionStatus: 'CompletedActionStatus'
  });
});
