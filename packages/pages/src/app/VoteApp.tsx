import React, { memo, useCallback, useState } from 'react';
import { useSchemaOrgAction, type PropertyValueSpecification } from 'use-schema-org-action';

type Action = {
  actionObject?: 'downvote' | 'upvote';
  'actionObject-input': PropertyValueSpecification;
  actionStatus?: `${'Active' | 'Completed' | 'Failed' | 'Potential'}ActionStatus`;
};

const VoteApp = () => {
  const [performed, setPerformed] = useState<any>();
  const [actionState, setActionState, { inputValidity, perform }] = useSchemaOrgAction<Action>(
    { 'actionObject-input': 'required' },
    async request => {
      setPerformed(request);

      await new Promise(resolve => setTimeout(resolve, 1_000));

      return {};
    }
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
      <h3>Current action</h3>
      <pre>{JSON.stringify(actionState, null, 2)}</pre>
      <h3>Submitted action</h3>
      <pre>{JSON.stringify(performed, null, 2)}</pre>
    </section>
  );
};

export default memo(VoteApp);
