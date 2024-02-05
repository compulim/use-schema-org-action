# `use-schema-org-action`

React hooks for handling logics of [Schema.org actions](https://schema.org/docs/actions.html).

## Background

## Demo

Click here for [our live demo](https://compulim.github.io/use-schema-org-action/).

## How to use

```ts
function submitVote(request, values) {
  // Request is created from action properties which has an input constraint.
  request === { actionOption: 'upvote' };

  // Value is a Map created from action properties which has a named input constraint.
  values.get('action') === 'upvote';
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
  action === { actionOption: 'upvote', actionStatus: 'PotentialActionStatus' };

  // To modify the action.
  setAction({ actionOption: 'downvote' });

  return <button disabled={!isValid} onClick={performAction}>Vote</button>
}
```

## API

> For complete API reference, please refer to TypeScript definition files.

```ts
useSchemaOrgAction<Action, Request, Response>(
  initialAction: Action,
  handler: (request: Request, values: Map<string, unknown>) => Promise<Response>
): [
  Action & { actionStatus: ActionStatusType },
  Dispatch<SetStateAction<Action>>
  () => Promise<void>,
  boolean
]
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

Properties of action that would participate in a request must have their input constraints defined. Similarly, properties of response that would merge into action must have their output constraints defined.

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
