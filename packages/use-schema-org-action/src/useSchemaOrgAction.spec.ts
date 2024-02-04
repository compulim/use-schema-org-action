/** @jest-environment jsdom */

import { act, renderHook } from '@testing-library/react';
import createDeferred from 'p-defer';
import { type JsonObject } from 'type-fest';

import { type PropertyValueSpecification } from './PropertyValueSpecificationSchema';
import useSchemaOrgAction from './useSchemaOrgAction';

type VoteAction = JsonObject & {
  actionObject?: string;
  'actionObject-input'?: PropertyValueSpecification;
  actionStatus?: string;
  'actionStatus-output'?: PropertyValueSpecification;
  agent?: { name?: string; 'name-output'?: PropertyValueSpecification };
  candidate?: { name?: string; 'name-input'?: PropertyValueSpecification };
  location?: string;
};

const voteAction: VoteAction = {
  actionObject: 'upvote',
  'actionObject-input': { valueName: 'action' },
  actionStatus: 'PotentialActionStatus',
  'actionStatus-output': {},
  agent: { 'name-output': { valueRequired: true } },
  candidate: { 'name-input': { valueName: 'name', valueRequired: true } }
};

type Handler = ReturnType<typeof jest.fn<Promise<Partial<VoteAction>>, [VoteAction, Map<string, unknown>]>>;

describe('with VoteAction', () => {
  let renderResult: ReturnType<typeof renderHook<ReturnType<typeof useSchemaOrgAction<VoteAction>>, object>>;

  beforeEach(() => {
    renderResult = renderHook(() => useSchemaOrgAction<VoteAction>(voteAction));
  });

  test('action should not have *-input/*-output', () =>
    expect(renderResult.result.current[0]).toEqual({
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
        actionObject: 'upvote',
        actionStatus: 'PotentialActionStatus',
        agent: {},
        candidate: { name: 'John Doe' }
      }));

    test('canPerform should be true', () => expect(renderResult.result.current[3]).toBe(true));

    describe('when perform', () => {
      let deferred: ReturnType<typeof createDeferred<Partial<VoteAction>>>;
      let handler: Handler;
      let performPromise: Promise<void>;

      beforeEach(() => {
        deferred = createDeferred();
        handler = jest.fn<Promise<Partial<VoteAction>>, [VoteAction, Map<string, unknown>]>(() => deferred.promise);

        act(() => {
          performPromise = renderResult.result.current[2]?.(handler) || Promise.resolve();
          performPromise.catch(() => {});

          renderResult.rerender();
        });
      });

      test('should have called the handler once', () => expect(handler).toHaveBeenCalledTimes(1));

      test('should have called the handler with action of ActiveActionStatus', () =>
        expect(handler.mock.lastCall?.[0]).toHaveProperty('actionStatus', 'ActiveActionStatus'));

      test('should have called the handler with the updated action', () =>
        expect(handler.mock.lastCall?.[0]).toEqual({
          actionObject: 'upvote',
          actionStatus: 'ActiveActionStatus',
          agent: {},
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
              agent: { name: 'Mary Doe' },
              location: 'Tokyo'
            })
          )
        );

        test('should not throw at the handler', () => performPromise);

        test('should change actionStatus to CompletedActionStatus', () =>
          expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'CompletedActionStatus'));

        test('should merge output with *-output', () =>
          expect(renderResult.result.current[0]).toEqual({
            actionObject: 'upvote',
            actionStatus: 'CompletedActionStatus',
            agent: { name: 'Mary Doe' },
            candidate: { name: 'John Doe' }
          }));

        test('should skip output without *-output', () =>
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
            actionObject: 'upvote',
            actionStatus: 'FailedActionStatus',
            agent: {},
            candidate: { name: 'John Doe' }
          }));
      });

      describe('failed with invalid output', () => {
        beforeEach(() => act(() => deferred.resolve({})));

        test('should throw at the handler', () => expect(performPromise).rejects.toThrow('Invalid type'));

        test('should change actionStatus to FailedActionStatus', () =>
          expect(renderResult.result.current[0]).toEqual({
            actionObject: 'upvote',
            actionStatus: 'FailedActionStatus',
            agent: {},
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

  describe('when input is invalid', () => {
    test('canPerform should be false', () => expect(renderResult.result.current[3]).toBe(false));
  });

  describe('when perform failed with invalid input', () => {
    let handler: Handler;
    let performPromise: Promise<void>;

    beforeEach(() => {
      handler = jest.fn();

      return act(() => {
        performPromise = renderResult.result.current[2](handler);
        performPromise.catch(() => {});

        renderResult.rerender();
      });
    });

    test('should throw at the handler', () => expect(performPromise).rejects.toThrow('Invalid type'));

    test('should change actionStatus to FailedActionStatus', () =>
      expect(renderResult.result.current[0]).toHaveProperty('actionStatus', 'FailedActionStatus'));
  });
});
