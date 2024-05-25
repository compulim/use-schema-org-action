import React, { useCallback, useState } from 'react';
import { useSchemaOrgAction, type PropertyValueSpecification } from 'use-schema-org-action';

type Action = {
  actionObject?: 'downvote' | 'upvote';
  'actionObject-input': PropertyValueSpecification;
  actionStatus?: `${'Active' | 'Completed' | 'Failed' | 'Potential'}ActionStatus`;
};

const App = () => {
  const [performed, setPerformed] = useState<object | undefined>(undefined);

  const handler = useCallback(
    (action: Partial<Action>, values: ReadonlyMap<string, unknown>): Promise<Partial<Action>> => {
      setPerformed({ action, values: Object.freeze(Object.fromEntries(values.entries())) });

      return new Promise(resolve => setTimeout(() => resolve({}), 1000));
    },
    [setPerformed]
  );

  const [action, setAction, performAction, canPerform] = useSchemaOrgAction<Action>(
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
    <main>
      <label>
        <input checked={action.actionObject === 'upvote'} onClick={handleUpvoteClick} type="radio" />
        Upvote
      </label>
      <label>
        <input checked={action.actionObject === 'downvote'} onClick={handleDownvoteClick} type="radio" />
        Downvote
      </label>
      <button
        disabled={!canPerform || action.actionStatus === 'ActiveActionStatus'}
        onClick={performAction}
        type="button"
      >
        Perform
      </button>
      <h2>Current action</h2>
      <pre>{JSON.stringify(action, null, 2)}</pre>
      <h2>Performed action</h2>
      <pre>{JSON.stringify(performed, null, 2)}</pre>
    </main>
  );
};

export default App;
