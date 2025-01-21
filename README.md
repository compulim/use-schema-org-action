# `use-schema-org-action`

React hook for handling logics and constraint validations of [Schema.org actions](https://schema.org/docs/actions.html).

## Background

Schema.org actions is a way to [describe the capability to perform an action and how that capability can be exercised](https://schema.org/docs/actions.html). Performing the action requires multiple steps:

1. Validates the action against input [constraints](https://schema.org/docs/actions.html#part-4)
1. Extracts named input properties from the action and forms a list of variables to support [RFC 6570 URI Template](https://www.rfc-editor.org/rfc/rfc6570) variable expansion
1. Marks the action as [active](https://schema.org/docs/actions.html#part-1)
1. Performs the action asynchronously
1. Validates the action result against output [constraints](https://schema.org/docs/actions.html#part-4)
1. Marks the action as [completed or failed](https://schema.org/docs/actions.html#part-1)
1. If successful, merges the output variables back into the action via named output properties

This package wraps all these steps as a React hook, including HTML-compatible constraint validation.

## Demo

Click here for [our live demo](https://compulim.github.io/use-schema-org-action/).

## How to use

The `useSchemaOrgAction` hook is designed to be similar to [React `useState` hook](https://react.dev/reference/react/useState) with extra functionality to expose the business logics of an action.

To install this package, run `npm install use-schema-org-action` or visit our [package on NPM](https://npmjs.com/package/use-schema-org-action).

```ts
import { useSchemaOrgAction, type PropertyValueSpecification } from 'use-schema-org-action';

// This function will submit the vote action asynchronously.
function submitVote(
  // Input variables is a Map by extracting named input properties. It is validated against input constraints.
  // It can be used in RFC 6570 URI Template for variable expansion.
  input: Map<string, unknown>,
  { signal }: { signal: AbortSignal }
): Promise<Map<string, unknown>> {
  console.log(input.get('action')); // 'upvote';

  // Return a Map of output variables, will be validated against output constraints before merging into the action.
  return new Map();
}

function VoteButton() {
  const [action, setAction, { isInputValid, submit }] = useSchemaOrgAction(
    {
      actionOption: 'upvote',
      'actionOption-input': {
        valueName: 'action',
        valueRequired: true
      } satisfies PropertyValueSpecification
    },
    submitVote
  );

  // Action include "actionStatus" property.
  console.log(action); // { actionOption: 'upvote', 'actionOption-input': { valueName: 'action' }, actionStatus: 'PotentialActionStatus' }

  // Similar to `useState`, to modify the action.
  useEffect(() => setAction({ actionOption: 'downvote' }), [setAction]);

  return <button disabled={!isValid} onClick={performAction}>Vote</button>;
}
```

## API

> For complete API reference, please refer to TypeScript definition files.

```js
function useSchemaOrgAction<T>(
  initialAction: T,
  handler: (variables: ReadonlyMap<string, unknown>, init: { signal: AbortSignal }) => Promise<ReadonlyMap<string, unknown>>
): [
  T,
  Dispatch<SetStateAction<T>>
  Readonly<{
    input: ReadonlyMap<string, unknown>;
    isInputValid: boolean;
    submit: () => Promise<void>;
  }>
];
```

## Designs

### Communicate with `actionStatus` and leave other properties open

Except [`actionStatus`](https://schema.org/actionStatus), other properties are not controlled.

Initially, `actionStatus` is set to `"PotentialActionStatus"`. When `performAction()` is called, it will set `actionStatus` accordingly:

- When `performAction()` is being called, `actionStatus` will become `"ActiveActionStatus"`
- When `performAction()` is being resolved, `actionStatus` will become `"CompletedActionStatus"`
- When `performAction()` is being rejected, `actionStatus` will become `"FailedActionStatus"`

In special circumstances:

- If `actionStatus` is passed in `initialAction`, its value will be used, instead of the default `"PotentialActionStatus"`
  - If `actionStatus` is passed incorrectly, the default value `"PotentialActionStatus"` will be used
- If `actionStatus-output` is set in `initialAction` with `valueName`, after `performAction()` is resolved, `actionStatus` from the output will be used, replacing `"CompletedActionStatus"`
  - If `actionStatus` is returned with an invalid value, error will be thrown

### Request/response are based on input/output constraints

Properties of action that would participate in a request must have their input constraints defined (`*-input`) with `valueName` property. Similarly, properties of response that would merge into action must have their output constraints defined (`*-output`) with `valueName` property.

## Behaviors

### Some properties are not passed to the handler

Properties of action that should be participated in the request must have input constraints defined (`*-input`) with `valueName` property defined.

Only properties with input constraints will become part of the request.

### Some results are not reflected in the updated action

Properties of response that should be merged into the action must have output constraints defined (`*-output`) with `valueName` property defined.

After an action is performed, properties marked with output constraints will be merged into the action.

### After the action is performed, how can I propagate the action status to the updated action?

Marks the action with `actionStatus-output` and `valueName` property defined. In the handler, returns `actionStatus` with a [supported value](https://schema.org/ActionStatusType). Then, the corresponding output variable will be merged into the action.

If the handler did not respond with `actionStatus` or output constraints is not defined, it will set `actionStatus` to `"CompletedActionStatus"` for resolutions, or `"FailedActionStatus"` for rejections.

### Why the `submit` function is being invalidated on every re-render?

The `handler` function (passed as second argument) should be memoized via `useCallback`.

When a different `handler` function is passed, the `submit` function will be invalidated.

## Roadmap

- Expose `valibot` error during constraint validation via [`Error.cause`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause) property

## Contributions

Like us? [Star](https://github.com/compulim/use-schema-org-action/stargazers) us.

Want to make it better? [File](https://github.com/compulim/use-schema-org-action/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/use-schema-org-action/pulls) a pull request.
