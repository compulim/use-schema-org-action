/** @jest-environment jsdom */

import { act, renderHook } from '@testing-library/react';
import createDeferred from 'p-defer';

import { type ActionWithActionStatus } from './ActionWithActionStatus';
import { type PropertyValueSpecification } from './PropertyValueSpecificationSchema';
import useSchemaOrgAction from './useSchemaOrgAction';

type VoteAction = {
  '@type': 'VoteAction';
  actionObject?: string;
  'actionObject-input'?: PropertyValueSpecification;
  actionStatus?: string;
  'actionStatus-input'?: PropertyValueSpecification;
  'actionStatus-output'?: PropertyValueSpecification;
  agent?: { name?: string; 'name-output'?: PropertyValueSpecification };
  candidate?: { name?: string; 'name-input'?: PropertyValueSpecification };
  location?: string;
};

const voteAction: VoteAction = {
  '@type': 'VoteAction',
  actionObject: 'upvote',
  'actionObject-input': { valueName: 'action' },
  actionStatus: 'PotentialActionStatus',
  'actionStatus-input': {},
  'actionStatus-output': { valueRequired: true },
  agent: { 'name-output': { valueRequired: true } },
  candidate: { 'name-input': { valueName: 'name', valueRequired: true } }
};

describe('with VoteAction', () => {
  type UseSchemaOrgAction = typeof useSchemaOrgAction<VoteAction>;
  type RawHandler = Parameters<UseSchemaOrgAction>[1];
  type Handler = jest.Mock<ReturnType<RawHandler>, Parameters<RawHandler>>;

  const handler: Handler = jest.fn();
  let renderResult: ReturnType<typeof renderHook<ReturnType<typeof useSchemaOrgAction<VoteAction>>, object>>;

  beforeEach(() => {
    renderResult = renderHook(() => useSchemaOrgAction<VoteAction>(voteAction, handler));
  });

  afterEach(() => handler.mockReset());

  test('action should not have *-input/*-output', () =>
    expect(renderResult.result.current[0]).toEqual({
      '@type': 'VoteAction',
      actionObject: 'upvote',
      actionStatus: 'PotentialActionStatus',
      agent: {},
      candidate: {}
    }));

  describe('when setting the "candidate.name" field', () => {
    beforeEach(() =>
      act(() =>
        renderResult.result.current[1](action => ({ ...action, candidate: { ...action.candidate, name: 'John Doe' } }))
      )
    );

    test('should have action updated with new "candidate.name" field', () =>
      expect(renderResult.result.current[0]).toEqual({
        '@type': 'VoteAction',
        actionObject: 'upvote',
        actionStatus: 'PotentialActionStatus',
        agent: {},
        candidate: { name: 'John Doe' }
      }));

    test('canPerform should be true', () => expect(renderResult.result.current[3]).toBe(true));

    describe('when perform', () => {
      let deferred: ReturnType<typeof createDeferred<Partial<ActionWithActionStatus<VoteAction>>>>;
      let performPromise: Promise<void>;

      beforeEach(() => {
        deferred = createDeferred();
        handler.mockImplementation(() => deferred.promise);

        act(() => {
          performPromise = renderResult.result.current[2]?.() || Promise.resolve();
          performPromise.catch(() => {});

          renderResult.rerender();
        });
      });

      test('should have called the handler once', () => expect(handler).toHaveBeenCalledTimes(1));

      test('should have called the handler with action of ActiveActionStatus', () =>
        expect(handler.mock.lastCall?.[0]).toHaveProperty('actionStatus', 'ActiveActionStatus'));

      test('should have called the handler with the updated action', () =>
        expect(handler.mock.lastCall?.[0]).toEqual({
          '@type': 'VoteAction',
          actionObject: 'upvote',
          actionStatus: 'ActiveActionStatus',
          // "agent" is noticebly missing because nothing in it has input constraints.
          candidate: { name: 'John Doe' }
        }));

      test('should have called the handler with values', () => {
        const values = handler.mock.lastCall?.[1];

        expect(values).not.toBeUndefined();

        expect(values?.size).toBe(2);
        expect(values?.get('action')).toBe('upvote');
        expect(values?.get('name')).toBe('John Doe');
      });

      test('should change to ActiveActionStatus', () =>
        expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'ActiveActionStatus'));

      describe('successfully', () => {
        beforeEach(() =>
          act(() =>
            deferred.resolve({
              '@type': 'VoteAction',
              agent: { name: 'Mary Doe' },
              location: 'Tokyo'
            })
          )
        );

        test('should not throw at the handler', () => performPromise);

        test('should change actionStatus to CompletedActionStatus', () =>
          expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'CompletedActionStatus'));

        test('should merge response properties with *-output', () =>
          expect(renderResult.result.current[0]).toEqual({
            '@type': 'VoteAction',
            actionObject: 'upvote',
            actionStatus: 'CompletedActionStatus',
            agent: { name: 'Mary Doe' },
            candidate: { name: 'John Doe' }
          }));

        test('should skip response properties without *-output', () =>
          expect(renderResult.result.current[0]).not.toHaveProperty('location'));
      });

      describe('failed with handler throw', () => {
        beforeEach(() =>
          act(() => {
            deferred.reject(new Error('Artificial.'));
          })
        );

        test('should throw at the handler', () => expect(performPromise).rejects.toThrow('Artificial.'));

        test('should change actionStatus to FailedActionStatus', () =>
          expect(renderResult.result.current[0]).toEqual({
            '@type': 'VoteAction',
            actionObject: 'upvote',
            actionStatus: 'FailedActionStatus',
            agent: {},
            candidate: { name: 'John Doe' }
          }));
      });

      describe('failed with invalid response', () => {
        beforeEach(() => act(() => deferred.resolve({})));

        test('should throw at the handler', () => expect(performPromise).rejects.toThrow('Invalid type'));

        test('should change actionStatus to FailedActionStatus', () =>
          expect(renderResult.result.current[0]).toEqual({
            '@type': 'VoteAction',
            actionObject: 'upvote',
            actionStatus: 'FailedActionStatus',
            agent: {},
            candidate: { name: 'John Doe' }
          }));
      });

      describe('succeed with FailedActionStatus', () => {
        beforeEach(() =>
          act(() => deferred.resolve({ actionStatus: 'FailedActionStatus', agent: { name: 'Mary Doe' } }))
        );

        test('should not throw at the handler', () => performPromise);

        test('should change actionStatus to FailedActionStatus', () =>
          expect(renderResult.result.current[0]).toEqual({
            '@type': 'VoteAction',
            actionObject: 'upvote',
            actionStatus: 'FailedActionStatus',
            agent: { name: 'Mary Doe' },
            candidate: { name: 'John Doe' }
          }));
      });

      describe('during unmount', () => {
        beforeEach(() => act(() => renderResult.unmount()));

        test('resolving handler should not update action', async () => {
          await act(() => deferred.resolve({ agent: { name: 'Mary Doe' } }));

          expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'ActiveActionStatus');
        });

        test('rejecting handler should not update action', async () => {
          await act(() => deferred.reject(new Error('Artificial.')));

          expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'ActiveActionStatus');
        });
      });
    });
  });

  describe('when request is invalid', () => {
    test('canPerform should be false', () => expect(renderResult.result.current[3]).toBe(false));
  });

  describe('when perform failed with invalid request', () => {
    let performPromise: Promise<void>;

    beforeEach(() =>
      act(() => {
        performPromise = renderResult.result.current[2]();
        performPromise.catch(() => {});

        renderResult.rerender();
      })
    );

    test('should throw at the handler', () => expect(performPromise).rejects.toThrow('Invalid type'));

    test('should change actionStatus to FailedActionStatus', () =>
      expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'FailedActionStatus'));
  });

  describe('when setting the "actionStatus" field', () => {
    beforeEach(() =>
      act(() => renderResult.result.current[1](action => ({ ...action, actionStatus: 'CompletedActionStatus' })))
    );

    test('should have actionStatus updated', () =>
      expect(renderResult.result.current[0]).toEqual({
        '@type': 'VoteAction',
        actionObject: 'upvote',
        actionStatus: 'CompletedActionStatus',
        agent: {},
        candidate: {}
      }));
  });
});

describe('with Action initialized with CompletedActionStatus', () => {
  let renderResult: ReturnType<typeof renderHook<ReturnType<typeof useSchemaOrgAction<VoteAction>>, object>>;

  beforeEach(() => {
    renderResult = renderHook(() =>
      useSchemaOrgAction<VoteAction>({ ...voteAction, actionStatus: 'CompletedActionStatus' }, () =>
        Promise.resolve({})
      )
    );
  });

  test('action should keep actionStatus', () =>
    expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'CompletedActionStatus'));
});

describe('with Action without actionStatus-output', () => {
  type SimpleAction = {
    '@type': 'VoteAction';
    actionOption: string;
    'actionOption-input'?: PropertyValueSpecification;
  };

  type UseSchemaOrgAction = typeof useSchemaOrgAction<
    SimpleAction,
    Partial<SimpleAction>,
    ActionWithActionStatus<Partial<SimpleAction>>
  >;

  type RawHandler = Parameters<UseSchemaOrgAction>[1];
  type Handler = jest.Mock<ReturnType<RawHandler>, Parameters<RawHandler>>;

  const handler: jest.Mock<ReturnType<Handler>, Parameters<Handler>> = jest.fn();
  let renderResult: ReturnType<typeof renderHook<ReturnType<UseSchemaOrgAction>, object>>;

  beforeEach(() => {
    renderResult = renderHook(() =>
      useSchemaOrgAction<SimpleAction, Partial<SimpleAction>, ActionWithActionStatus<Partial<SimpleAction>>>(
        {
          '@type': 'VoteAction',
          actionOption: 'upvote',
          'actionOption-input': { valueRequired: true }
        },
        handler
      )
    );
  });

  afterEach(() => handler.mockReset());

  describe('when perform and respond with "actionStatus" property', () => {
    beforeEach(() => {
      handler.mockImplementation(() => Promise.resolve({ actionStatus: 'FailedActionStatus' }));

      return act(() => renderResult.result.current[2]());
    });

    test('should not set "actionStatus" from response', () =>
      expect(renderResult.result.current[0]).toEqual({
        '@type': 'VoteAction',
        actionOption: 'upvote',
        actionStatus: 'CompletedActionStatus'
      }));
  });
});

describe('"performAction" function', () => {
  let handler: () => Promise<object>;
  let renderResult: ReturnType<typeof renderHook<ReturnType<typeof useSchemaOrgAction>, object>>;
  let firstPerform: ReturnType<typeof useSchemaOrgAction>[2];

  beforeEach(() => {
    handler = () => Promise.resolve({});
    renderResult = renderHook(() => useSchemaOrgAction({}, handler));

    firstPerform = renderResult.result.current[2];
  });

  test('should be memoized if handler is not changed', () => {
    renderResult.rerender();

    expect(firstPerform).toBe(renderResult.result.current[2]);
  });

  test('should not be memoized if handler is changed', () => {
    handler = () => Promise.resolve({});
    renderResult.rerender();

    expect(firstPerform).not.toBe(renderResult.result.current[2]);
  });
});
