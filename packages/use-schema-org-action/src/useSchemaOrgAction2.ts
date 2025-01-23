import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useRefFrom } from 'use-ref-from';
import {
  fallback,
  object,
  optional,
  parse,
  type ErrorMessage,
  type ObjectEntries,
  type ObjectIssue,
  type ObjectSchema
} from 'valibot';
import { type ActionState } from './ActionState.ts';
import { actionStatusTypeSchema } from './ActionStatusType.ts';
import buildSchemaFromConstraintsRecursive from './private/buildSchemaFromConstraintsRecursive.ts';
import extractVariablesFromActionStateRecursive from './private/extractVariablesFromActionStateRecursive.ts';
import mergeActionStateRecursive from './private/mergeActionStateRecursive.ts';
import validateConstraints from './private/validateConstraints.ts';
import { type VariableMap } from './VariableMap.ts';

type ActionHandler = (
  request: ActionState,
  inputVariables: VariableMap,
  init: Readonly<{ signal: AbortSignal }>
) => Promise<ActionState>;

export default function useSchemaOrgAction<T extends object = object>(
  initialAction: T,
  handler: ActionHandler,
  initialActionState: ActionState = {}
): readonly [
  ActionState,
  Dispatch<SetStateAction<ActionState>>,
  Readonly<{
    inputVariables: VariableMap;
    inputValidity: ValidityState;
    inputSchema: ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>;
    outputSchema: ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>;
    submit: () => Promise<void>;
  }>
] {
  const [actionState, setActionState] = useState<ActionState>(() => ({
    ...(initialActionState || {}),
    actionStatus: parse(
      fallback(actionStatusTypeSchema, 'PotentialActionStatus'),
      ('actionStatus' in initialActionState && initialActionState['actionStatus']) ||
        ('actionStatus' in initialAction && initialAction.actionStatus)
    )
  }));
  const abortController = useMemo(() => new AbortController(), []);
  const handlerRef = useRefFrom(handler);
  const inputSchema = useMemo(() => buildSchemaFromConstraintsRecursive(initialAction, 'input'), [initialAction]);
  const outputSchema = useMemo(() => buildSchemaFromConstraintsRecursive(initialAction, 'output'), [initialAction]);

  const actionStateRef = useRefFrom(actionState);
  const initialActionRef = useRefFrom(initialAction);
  const inputSchemaRef = useRefFrom(inputSchema);
  const inputValidity = useMemo(() => validateConstraints(inputSchema, actionState), [actionState, inputSchema]);
  const outputSchemaRef = useRefFrom(outputSchema);

  const submit = useCallback<() => Promise<void>>(async () => {
    if (!validateConstraints(inputSchemaRef.current, actionStateRef.current).valid) {
      setActionState(actionState => ({ ...actionState, actionStatus: 'FailedActionStatus' }));

      return Promise.reject(Error('Input is invalid, cannot submit.'));
    }

    setActionState(actionState => ({ ...actionState, actionStatus: 'ActiveActionStatus' }));

    const inputVariables = extractVariablesFromActionStateRecursive(
      initialActionRef.current,
      actionStateRef.current,
      'input'
    );

    // TODO: Refactor to extractInputPropertiesFromActionStateRecursive.
    const request = mergeActionStateRecursive(initialActionRef.current, {}, actionStateRef.current, 'input');

    const response = await handlerRef.current(request, inputVariables, { signal: abortController.signal });

    try {
      parse(outputSchema, response);
      parse(object({ actionStatus: optional(actionStatusTypeSchema) }), response);
    } catch (cause) {
      if (!abortController.signal.aborted) {
        setActionState(actionState => ({ ...actionState, actionStatus: 'FailedActionStatus' }));
      }

      const error = new Error('Output is invalid.');

      error.cause = cause;

      throw error;
    }

    if (abortController.signal.aborted) {
      return;
    }

    setActionState(actionState =>
      mergeActionStateRecursive(
        initialActionRef.current,
        { ...actionState, actionStatus: 'CompletedActionStatus' },
        response,
        'output'
      )
    );
  }, [abortController, actionStateRef, handlerRef, initialActionRef, inputSchemaRef, outputSchemaRef, setActionState]);

  const inputVariables = useMemo(
    () => extractVariablesFromActionStateRecursive(initialAction, actionState, 'input'),
    [actionState, initialAction]
  );

  const options = useMemo(
    () =>
      Object.freeze({
        inputSchema,
        inputValidity,
        inputVariables,
        outputSchema,
        submit
      }),
    [inputSchema, inputValidity, inputVariables, outputSchema, submit]
  );

  useEffect(() => () => abortController.abort(), [abortController]);

  return useMemo(
    () => Object.freeze([actionState, setActionState, options] as const),
    [actionState, options, setActionState]
  );
}

export { type ActionHandler };
