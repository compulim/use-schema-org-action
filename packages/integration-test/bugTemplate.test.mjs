import { act } from '@compulim/test-harness/act';
import { cleanup, renderHook } from '@compulim/test-harness/renderHook';
import { expect } from 'expect';
import { afterEach, mock, test } from 'node:test';
import { useSchemaOrgAction } from 'use-schema-org-action';

afterEach(cleanup);

test('should work', async () => {
  const handler = mock.fn();

  handler.mock.mockImplementation(() => ({}));

  // WHEN: Rendered.
  const renderResult = renderHook(() =>
    useSchemaOrgAction(
      {
        '@type': 'VoteAction',
        actionOption: 'upvote',
        'actionOption-input': { valueName: 'action' }
      },
      handler
    )
  );

  // THEN: Should mark the "actionStatus" as "PotentialActionStatus"
  expect(renderResult.result.current[0]).toEqual({
    actionOption: 'upvote',
    actionStatus: 'PotentialActionStatus'
  });

  // WHEN: Calling setActionState to update.
  act(() => renderResult.result.current[1](actionState => ({ ...actionState, actionOption: 'downvote' })));

  // THEN: Should have actionState.actionOption of "downvote".
  expect(renderResult.result.current[0]).toEqual({
    actionOption: 'downvote',
    actionStatus: 'PotentialActionStatus'
  });

  // WHEN: Calling perform().
  await act(() => renderResult.result.current[2].perform());

  // THEN: Should have called the handler once.
  expect(handler.mock.callCount()).toBe(1);
  expect(handler.mock.calls.at(-1)?.arguments).toEqual([
    { actionOption: 'downvote' },
    expect.any(Map),
    expect.any(Object)
  ]);

  // THEN: Should mark the "actionStatus" as "CompletedActionStatus".
  expect(renderResult.result.current[0]).toEqual({
    actionOption: 'downvote',
    actionStatus: 'CompletedActionStatus'
  });
});
