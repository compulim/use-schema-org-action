# `use-schema-org-action`

React hook for handling logics of [Schema.org actions](https://schema.org/docs/actions.html).

## Background

Schema.org actions is a way to [describe the capability to perform an action and how that capability can be exercised](https://schema.org/docs/actions.html). Performing the action contains multiple steps:

1. Picks properties from the action and creates a request object
1. Validates the request against the defined input constraints
1. Picks named properties from the action and creates a list of variables for variable expansion (as described in [RFC 6570](https://www.rfc-editor.org/rfc/rfc6570))
1. Marks the action as in-progress
1. Performs the action (probably asynchronously)
1. Marks the action as completed
1. Validates the response against the defined output constraints
1. Merges the response into the action

This package wraps all these steps as a React hook.

## Demo

Click here for [our live demo](https://compulim.github.io/use-schema-org-action/).

## How to use

To install this package, run `npm install use-schema-org-action` or visit our [package on NPM](https://npmjs.com/package/use-schema-org/action).

```ts
import { useSchemaOrgAction } from 'use-schema-org-action';

function submitVote(request, values) {
  // Request is created from action properties which has an input constraint.
  console.log(request); // { actionOption: 'upvote' };

  // Value is a Map created from action properties which has a named input constraint.
  console.log(values.get('action')); // 'upvote';
}

function VoteButton() {
  const [action, setAction, performAction, isValid] = useSchemaOrgAction(
    {
      actionOption: 'upvote',
      'actionOption-input': {
        valueName: 'action'
      }
    },
    submitVote
  );

  // Action exclude all input/output constraints, and include "actionStatus" property.
  console.log(action); // { actionOption: 'upvote', actionStatus: 'PotentialActionStatus' };

  // To modify the action.
  useEffect(() => setAction({ actionOption: 'downvote' }), [setAction]);

  return <button disabled={!isValid} onClick={performAction}>Vote</button>;
}
```

## API

> For complete API reference, please refer to TypeScript definition files.

```ts
function useSchemaOrgAction<Action, Request, Response>(
  initialAction: Action,
  handler: (request: Request, values: Map<string, unknown>) => Promise<Response>
): [
  Action & { actionStatus: ActionStatusType },
  Dispatch<SetStateAction<Action>>
  () => Promise<void>,
  boolean
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

- If `actionStatus` is set in `initialAction`, its value will be used, replacing `"PotentialActionStatus"`
- If `actionStatus-output` is set in `initialAction`, after `performAction()` is resolved, `actionStatus` from the response will be used, replacing `"CompletedActionStatus"`

### Request/response are based on input/output constraints

Properties of action that would participate in a request must have their input constraints defined (`*-input`). Similarly, properties of response that would merge into action must have their output constraints defined (`*-output`).

All constraints must be defined in `initialAction` and cannot be modified later.

## Behaviors

### Some properties are not passed to the handler

Properties of action that should be participated in the request must have input constraints (`*-input`) defined.

Only properties with input constraints will become part of the request.

### Some results are not reflected in the updated action

Properties of response that should be merged into the action must have output constraints (`*-output`) defined.

After an action is performed, properties marked with output constraints will be merged into the action.

### After the action is performed, how can I propagate the action status to the updated action?

Marks the action with `actionStatus-output`. In the handler, returns `actionStatus` with a [supported value](https://schema.org/ActionStatusType). It will be merged into the action.

If the handler did not respond with `actionStatus` or output constraints is not defined, it will set `actionStatus` to `"CompletedActionStatus"` for resolutions, or `"FailedActionStatus"` for rejections.

### Why the `performAction` function is being invalidated on every re-render?

The `handler` function (passed as second argument) should be memoized via `useCallback`.

When a different `handler` function is passed, the `performAction` will be invalidated.

## Contributions

Like us? [Star](https://github.com/compulim/use-schema-org-action/stargazers) us.

Want to make it better? [File](https://github.com/compulim/use-schema-org-action/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/use-schema-org-action/pulls) a pull request.
