# `use-schema-org-action`

React hooks handling logics of [Schema.org Actions](https://schema.org/docs/actions.html).

## Background

## Demo

Click here for [our live demo](https://compulim.github.io/use-schema-org-action/).

## How to use

## API

```ts
```

## Designs

### Keeping schema as flexible as possible

Except [`actionStatus`](https://schema.org/actionStatus), other properties are not controlled.

## Behaviors

### Some properties are not passed to the handler

Make sure all properties that should be part of the request have input constraints (`*-input`) defined.

Only properties with input constraints will become part of the request.

### Some results are not reflected in the updated action

Make sure all results have output constraints (`*-output`) defined.

After an action is performed, only results marked with output constraints are propagated to the updated action.

### After the action is performed, how can I propagate the action status to the updated action?

Marks the action with `actionStatus-output`. In the handler, returns `actionStatus` with a supported value. It will be propagated to the updated action.

## Contributions

Like us? [Star](https://github.com/compulim/use-schema-org-action/stargazers) us.

Want to make it better? [File](https://github.com/compulim/use-schema-org-action/issues) us an issue.

Don't like something you see? [Submit](https://github.com/compulim/use-schema-org-action/pulls) a pull request.
