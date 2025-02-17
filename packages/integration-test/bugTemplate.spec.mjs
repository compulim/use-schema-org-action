/** @jest-environment @happy-dom/jest-environment */

import { act, renderHook } from '@testing-library/react';
import { useSchemaOrgAction } from 'use-schema-org-action';

test('should work', async () => {
  const handler = jest.fn().mockResolvedValue({});

  // WHEN: Rendered.
  const renderResult = renderHook(() =>
    useSchemaOrgAction(
      {
        '@type': 'VoteAction',
        'actionOption-input': { valueName: 'action' }
      },
      handler,
      { actionOption: 'upvote' }
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
  expect(handler).toHaveBeenCalledTimes(1);
  expect(handler).toHaveBeenLastCalledWith({ actionOption: 'downvote' }, expect.any(Map), expect.any(Object));

  // THEN: Should mark the "actionStatus" as "CompletedActionStatus".
  expect(renderResult.result.current[0]).toEqual({
    actionOption: 'downvote',
    actionStatus: 'CompletedActionStatus'
  });
});
