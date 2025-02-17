import React, { memo, useCallback, useState } from 'react';
import { useSchemaOrgAction, type ActionHandler, type PropertyValueSpecification } from 'use-schema-org-action';

type Action = {
  actionObject?: 'downvote' | 'upvote';
  'actionObject-input': PropertyValueSpecification;
  actionStatus?: `${'Active' | 'Completed' | 'Failed' | 'Potential'}ActionStatus`;
  'endTime-output': PropertyValueSpecification;
};

const VoteApp = () => {
  const [currentRequest, setCurrentRequest] = useState<any>();
  const [currentResponse, setCurrentResponse] = useState<any>();

  const handlePerform = useCallback<ActionHandler>(
    async request => {
      setCurrentRequest(request);

      const res = await fetch('https://example.com/vote', { body: JSON.stringify(request), method: 'POST' });

      const response = await res.json();

      setCurrentResponse(response);

      return response;
    },
    [setCurrentRequest, setCurrentResponse]
  );

  const [actionState, setActionState, { inputValidity, perform }] = useSchemaOrgAction<Action>(
    { 'actionObject-input': 'required', 'endTime-output': 'required' },
    handlePerform
  );

  const handleDownvoteClick = useCallback(
    () => setActionState(actionState => ({ ...actionState, actionObject: 'downvote' })),
    [setActionState]
  );

  const handleUpvoteClick = useCallback(
    () => setActionState(actionState => ({ ...actionState, actionObject: 'upvote' })),
    [setActionState]
  );

  return (
    <section>
      <h2>Vote</h2>
      <label>
        <input checked={actionState['actionObject'] === 'upvote'} onClick={handleUpvoteClick} type="radio" />
        Upvote
      </label>
      <label>
        <input checked={actionState['actionObject'] === 'downvote'} onClick={handleDownvoteClick} type="radio" />
        Downvote
      </label>
      <button
        disabled={!inputValidity.valid || actionState['actionStatus'] === 'ActiveActionStatus'}
        onClick={perform}
        type="button"
      >
        Perform
      </button>
      <h3>Current action state</h3>
      <pre>{JSON.stringify(actionState, null, 2)}</pre>
      <h3>Request body</h3>
      <pre>{JSON.stringify(currentRequest, null, 2)}</pre>
      <h3>Response body</h3>
      <pre>{JSON.stringify(currentResponse, null, 2)}</pre>
    </section>
  );
};

export default memo(VoteApp);
