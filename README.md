# `use-schema-org-action`

React hooks handling logics of [Schema.org Actions](https://schema.org/docs/actions.html).

## Background

## Demo

Click here for [our live demo](https://compulim.github.io/use-schema-org-action/).

## How to use

```ts
const [action, setAction, performAction, isValid] = useSchemaOrgAction(
  {
    actionOption: 'upvote',
    'actionOption-input': {
      valueName: 'action'
    }
  },
  useCallback((request, values) => {
    request === { actionOption: 'upvote' };
    values.get('action') === 'upvote';
  }, [])
);

action === { actionOption: 'upvote', actionStatus: 'PotentialActionStatus' };

setAction({ actionOption: 'downvote' });

isValid && performAction();
```

## API

```ts
useSchemaOrgAction<Action, Request, Response>(initialAction: Action, handler: (request: Request, values: Map<string, unknown>): Promise<Response>): [
  Action,
  Dispatch<SetStateAction<Action>>
  (): Promise<void>,
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

### All input/output properties must have their constraints defined

Properties of action that would participate in request must have their input constraints defined. Similarly, properties of response that would merge into action must have their output constraints defined.

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

### Why the `performAction` function is invalidated on every re-render?

The handler function (second argument) should be memoized via `useCallback`.

When the handler function change, the `performAction` will be invalidated.

## Contributions

Like us? [Star](https://github.com/compulim/use-schema-org-action/stargazers) us.

Want to make it better? [File](https://github.com/compulim/use-schema-org-action/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/use-schema-org-action/pulls) a pull request.
