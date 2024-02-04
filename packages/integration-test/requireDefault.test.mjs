/** @jest-environment jsdom */

const { create } = require('react-test-renderer');
const { useSchemaOrgAction } = require('use-schema-org-action');

test('simple scenario', () => {
  // SETUP: With a VoteAction.
  const App = () => {
    const [action] = useSchemaOrgAction({
      '@type': 'VoteAction',
      actionOption: 'upvote',
      'actionOption-input': { valueName: 'action' }
    });

    return JSON.stringify(action);
  };

  // WHEN: Rendered.
  const renderer = create(<App />);

  // THEN: It should render JSON of { actionOption: 'upvote' }.
  expect(renderer.toJSON()).toMatchInlineSnapshot(`"{"actionOption":"upvote"}"`);
});
