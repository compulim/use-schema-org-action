/** @jest-environment @happy-dom/jest-environment */

const React = require('react');
const { create } = require('react-test-renderer');
const { useSchemaOrgAction } = require('use-schema-org-action');

test('simple scenario', () => {
  // SETUP: With a VoteAction.
  const App = () => {
    const [action] = useSchemaOrgAction(
      {
        '@type': 'VoteAction',
        actionOption: 'upvote',
        'actionOption-input': { valueName: 'action' }
      },
      () => Promise.resolve({})
    );

    return JSON.stringify(action);
  };

  // WHEN: Rendered.
  const renderer = create(<App />);

  // THEN: It should render JSON of { "@type": "VoteAction", actionOption: 'upvote', actionStatus: 'PotentialActionStatus' }.
  expect(renderer.toJSON()).toBe(
    '{"actionStatus":"PotentialActionStatus","actionOption":"upvote"}'
  );
});
