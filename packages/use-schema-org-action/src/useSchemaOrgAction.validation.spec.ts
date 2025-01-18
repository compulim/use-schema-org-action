/** @jest-environment jsdom */

import { act } from 'react';

import { type PropertyValueSpecification } from './PropertyValueSpecificationSchema';
import { type SchemaOrgObject } from './SchemaOrgObject';
import useSchemaOrgAction from './useSchemaOrgAction';

const renderHook: <T, P>(
  render: (props: P) => T,
  options?: { initialProps: P }
) => { rerender: (props: P) => void; result: { current: T }; unmount: () => void } =
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@testing-library/react').renderHook ||
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  require('@testing-library/react-hooks').renderHook;

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

let handler: jest.Mock<
  Promise<Readonly<Partial<SearchAction>>>,
  [Readonly<Partial<SchemaOrgObject>>, ReadonlyMap<string, unknown>]
>;

describe.each([
  ['"required" in string form', 'required'],
  ['"required" in object form', { valueRequired: true }]
])('%s', (_, input) => {
  let searchAction: SearchAction;

  beforeEach(() => {
    handler = jest.fn(async (action, _) => action as any);

    // SETUP: The action from the spec.
    searchAction = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Example.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'http://example.com/search?q={q}',
        'query-input': input
      }
    };
  });

  test('when perform without fulfilling "required" should throw', async () => {
    // WHEN: Perform the action.
    const renderResult = await act(() => renderHook(() => useSchemaOrgAction<SearchAction>(searchAction, handler)));
    const promise = act(() => renderResult.result.current[2]());

    await expect(promise).rejects.toThrow();
  });

  test('when perform with fulfilling "required" should throw', async () => {
    // WHEN: Perform the action.
    const renderResult = await act(() =>
      renderHook(() =>
        useSchemaOrgAction<SearchAction>(
          {
            ...searchAction,
            potentialAction: {
              ...searchAction.potentialAction,
              query: 'Hello, World!'
            }
          },
          handler
        )
      )
    );

    const promise = act(() => renderResult.result.current[2]());

    await expect(promise).resolves.toBeUndefined();
  });
});
