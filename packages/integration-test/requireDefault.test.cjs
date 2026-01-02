const { expect } = require('expect');
const { test } = require('node:test');
const { createElement } = require('react');
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
  const renderer = create(createElement(App));

  // THEN: It should render JSON of { "@type": "VoteAction", actionOption: 'upvote', actionStatus: 'PotentialActionStatus' }.
  expect(renderer.toJSON()).toBe('{"actionOption":"upvote","actionStatus":"PotentialActionStatus"}');
});
