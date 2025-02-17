/** @jest-environment @happy-dom/jest-environment */

import React from 'react';
import { create } from 'react-test-renderer';
import { useSchemaOrgAction } from 'use-schema-org-action';

test('simple scenario', () => {
  // SETUP: With a VoteAction.
  const App = () => {
    const [actionState] = useSchemaOrgAction(
      {
        '@type': 'VoteAction',
        actionOption: 'upvote',
        'actionOption-input': { valueName: 'action' }
      },
      () => Promise.resolve({})
    );

    return JSON.stringify(actionState);
  };

  // WHEN: Rendered.
  const renderer = create(<App />);

  // THEN: It should render JSON of { actionOption: 'upvote', actionStatus: 'PotentialActionStatus' }.
  expect(renderer.toJSON()).toBe('{"actionOption":"upvote","actionStatus":"PotentialActionStatus"}');
});
