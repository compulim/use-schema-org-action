import React, { memo, useCallback, useState } from 'react';
import { useSchemaOrgAction, type PropertyValueSpecification } from 'use-schema-org-action';

type Action = {
  actionObject?: 'downvote' | 'upvote';
  'actionObject-input': PropertyValueSpecification;
  actionStatus?: `${'Active' | 'Completed' | 'Failed' | 'Potential'}ActionStatus`;
};

const VoteApp = () => {
  const [performed, setPerformed] = useState<object | undefined>(undefined);

  const handler = useCallback(
    (
      input: ReadonlyMap<string, boolean | Date | number | string | undefined>
    ): Promise<ReadonlyMap<string, boolean | Date | number | string | undefined>> => {
      setPerformed({ action, values: Object.freeze(Object.fromEntries(input.entries())) });

      return new Promise(resolve => setTimeout(() => resolve(new Map()), 1000));
    },
    [setPerformed]
  );

  const [action, setAction, { isInputValid, submit }] = useSchemaOrgAction<Action>(
    {
      'actionObject-input': {
        valueName: 'action',
        valueRequired: true
      }
    },
    handler
  );

  const handleDownvoteClick = useCallback(
    () => setAction(action => ({ ...action, actionObject: 'downvote' })),
    [setAction]
  );

  const handleUpvoteClick = useCallback(
    () => setAction(action => ({ ...action, actionObject: 'upvote' })),
    [setAction]
  );

  return (
    <section>
      <h2>Vote</h2>
      <label>
        <input checked={action.actionObject === 'upvote'} onClick={handleUpvoteClick} type="radio" />
        Upvote
      </label>
      <label>
        <input checked={action.actionObject === 'downvote'} onClick={handleDownvoteClick} type="radio" />
        Downvote
      </label>
      <button disabled={!isInputValid || action.actionStatus === 'ActiveActionStatus'} onClick={submit} type="button">
        Perform
      </button>
      <h3>Current action</h3>
      <pre>{JSON.stringify(action, null, 2)}</pre>
      <h3>Submitted action</h3>
      <pre>{JSON.stringify(performed, null, 2)}</pre>
    </section>
  );
};

export default memo(VoteApp);
