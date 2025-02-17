import { useCallback, useEffect, useMemo, useRef, useState, type Dispatch, type SetStateAction } from 'react';
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
import { type ActionHandler } from './ActionHandler.ts';
import { type ActionState } from './ActionState.ts';
import { actionStatusTypeSchema } from './ActionStatusType.ts';
import buildSchemaFromConstraintsRecursive from './private/buildSchemaFromConstraintsRecursive.ts';
import extractActionStateFromAction from './private/extractActionStateFromAction.ts';
import extractVariablesFromActionStateRecursive from './private/extractVariablesFromActionStateRecursive.ts';
import mergeActionStateRecursive from './private/mergeActionStateRecursive.ts';
import validateConstraints from './private/validateConstraints.ts';
import { type VariableMap } from './VariableMap.ts';

/**
 * Returns a stateful action state, a function to update it, and a function to perform the action.
 *
 * Action state contains only input/output properties and [`actionStatus` property](https://schema.org/actionStatus).
 *
 * @param initialAction Action which the action state is based on.
 * @param onPerform Function to call when the action is being performed.
 * @returns Returns a stateful action state, a function to update it, and a function to perform the action.
 */
export default function useSchemaOrgAction<T extends object = object>(
  /** Initial action which the action state is based on. */
  initialAction: T,
  /** Function to call when the action is performed. */
  onPerform: ActionHandler
): readonly [
  /** A stateful action state. */
  ActionState,
  /** A function to update the action state. */
  Dispatch<SetStateAction<ActionState>>,
  Readonly<{
    /** `Map` of named input properties. */
    inputVariables: VariableMap;
    /** Validity of the input properties. */
    inputValidity: ValidityState;
    /** Validation schema for input properties. */
    inputSchema: ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>;
    /** Validation schema for output properties. */
    outputSchema: ObjectSchema<ObjectEntries, ErrorMessage<ObjectIssue> | undefined>;
    /** A function to perform the action. */
    perform: () => Promise<void>;
  }>
] {
  const [actionState, setActionState] = useState<ActionState>(() => ({
    ...extractActionStateFromAction(initialAction),
    actionStatus: parse(
      fallback(actionStatusTypeSchema, 'PotentialActionStatus'),
      'actionStatus' in initialAction && initialAction.actionStatus
    )
  }));
  const abortController = useMemo(() => new AbortController(), []);
  const initialActionRef = useRef(initialAction);
  const onPerformRef = useRefFrom(onPerform);

  const actionStateRef = useRefFrom(actionState);
  const inputSchema = useMemo(() => buildSchemaFromConstraintsRecursive(initialActionRef.current, 'input'), [initialActionRef]);
  const outputSchema = useMemo(() => buildSchemaFromConstraintsRecursive(initialActionRef.current, 'output'), [initialActionRef]);

  const inputSchemaRef = useRefFrom(inputSchema);
  const inputValidity = useMemo(() => validateConstraints(inputSchema, actionState), [actionState, inputSchema]);
  const outputSchemaRef = useRefFrom(outputSchema);

  const perform = useCallback<() => Promise<void>>(async () => {
    if (!validateConstraints(inputSchemaRef.current, actionStateRef.current).valid) {
      setActionState(actionState => ({ ...actionState, actionStatus: 'FailedActionStatus' }));

      return Promise.reject(Error('Input is invalid, cannot submit.'));
    }

    setActionState(actionState => ({ ...actionState, actionStatus: 'ActiveActionStatus' }));

    let response: ActionState;

    try {
      const inputVariables = extractVariablesFromActionStateRecursive(
        initialActionRef.current,
        actionStateRef.current,
        'input'
      );

      // TODO: Refactor to extractInputPropertiesFromActionStateRecursive helper.
      const request = mergeActionStateRecursive(initialActionRef.current, {}, actionStateRef.current, 'input');

      response = await onPerformRef.current(request, inputVariables, { signal: abortController.signal });

      try {
        parse(outputSchema, response);
        parse(object({ actionStatus: optional(actionStatusTypeSchema) }), response);
      } catch (cause) {
        const error = new Error('Output is invalid.');

        error.cause = cause;

        throw error;
      }

      if (abortController.signal.aborted) {
        return;
      }
    } catch (error) {
      if (!abortController.signal.aborted) {
        setActionState(actionState => ({ ...actionState, actionStatus: 'FailedActionStatus' }));
      }

      throw error;
    }

    setActionState(actionState =>
      mergeActionStateRecursive(
        initialActionRef.current,
        { ...actionState, actionStatus: 'CompletedActionStatus' },
        response,
        'output'
      )
    );
  }, [abortController, initialActionRef, actionStateRef, inputSchemaRef, onPerformRef, outputSchemaRef, setActionState]);

  const inputVariables = useMemo(
    () => extractVariablesFromActionStateRecursive(initialActionRef.current, actionState, 'input'),
    [actionState, initialActionRef]
  );

  const options = useMemo(
    () =>
      Object.freeze({
        inputSchema,
        inputValidity,
        inputVariables,
        outputSchema,
        perform
      }),
    [inputSchema, inputValidity, inputVariables, outputSchema, perform]
  );

  useEffect(() => () => abortController.abort(), [abortController]);

  return useMemo(
    () => Object.freeze([actionState, setActionState, options] as const),
    [actionState, options, setActionState]
  );
}

export { type ActionHandler };
