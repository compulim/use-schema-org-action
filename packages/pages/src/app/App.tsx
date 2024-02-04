import { useCallback, useState } from 'react';
import { useSchemaOrgAction, type PropertyValueSpecification } from 'use-schema-org-action';

const App = () => {
  const [action, setAction, performAction] = useSchemaOrgAction<{
    actionObject?: 'downvote' | 'upvote';
    'actionObject-input': PropertyValueSpecification;
    actionStatus?: `${'Active' | 'Completed' | 'Failed' | 'Potential'}ActionStatus`;
  }>({
    'actionObject-input': {
      valueName: 'action'
    }
  });

  const [performed, setPerformed] = useState<object | undefined>(undefined);

  const handleClick = useCallback(() => {
    performAction((action, values) => {
      setPerformed({ action, values: Object.fromEntries(values.entries()) });

      return new Promise(resolve => setTimeout(() => resolve({}), 1000));
    });
  }, [performAction, setPerformed]);

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
      <button disabled={action.actionStatus === 'PotentialActionStatus'} onClick={handleClick} type="button">
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
