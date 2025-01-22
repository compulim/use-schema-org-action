import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { type PartialDeep } from 'type-fest';
import { useRefFrom } from 'use-ref-from';
import { fallback, object, optional, parse } from 'valibot';
import { actionStatusTypeSchema, type ActionStatusType } from './ActionStatusType.ts';
import { type ActionWithActionStatus } from './ActionWithActionStatus.ts';
import buildSchemaFromConstraintsRecursive from './private/buildSchemaFromConstraintsRecursive.ts';
import extractRequestFromActionRecursive from './private/extractRequestFromActionRecursive.ts';
import extractVariablesFromActionRecursive from './private/extractVariablesFromActionRecursive.ts';
import mergeResponseIntoActionRecursive from './private/mergeResponseIntoActionRecursive.ts';
import validateConstraints from './private/validateConstraints.ts';
import { type VariableMap } from './VariableMap.ts';

type ActionHandler<T extends object> = (
  input: VariableMap,
  request: PartialDeep<T & { actionStatus: ActionStatusType }>,
  init: Readonly<{ signal: AbortSignal }>
) => Promise<PartialDeep<T & { actionStatus: ActionStatusType }>>;

export default function useSchemaOrgAction<T extends object = object>(
  initialAction: T,
  handler: ActionHandler<T>
): readonly [
  ActionWithActionStatus<T>,
  Dispatch<SetStateAction<ActionWithActionStatus<T>>>,
  Readonly<{
    input: VariableMap;
    inputValidity: ValidityState;
    submit: () => Promise<void>;
  }>
] {
  const [action, setAction] = useState<ActionWithActionStatus<T>>(() => ({
    ...initialAction,
    actionStatus: parse(
      fallback(actionStatusTypeSchema, 'PotentialActionStatus'),
      'actionStatus' in initialAction && initialAction.actionStatus
    )
  }));
  const abortController = useMemo(() => new AbortController(), []);
  const actionRef = useRefFrom(action);
  const handlerRef = useRefFrom(handler);

  const inputValidity = useMemo(() => validateConstraints(action, 'input'), [action]);
  const inputValidityRef = useRefFrom(inputValidity);

  const submit = useCallback<() => Promise<void>>(async () => {
    if (!inputValidityRef.current.valid) {
      setAction(action => ({ ...action, actionStatus: 'FailedActionStatus' }));

      return Promise.reject(Error('Input is invalid, cannot submit.'));
    }

    setAction(action => ({ ...action, actionStatus: 'ActiveActionStatus' }));

    const input = extractVariablesFromActionRecursive(actionRef.current, 'input');
    const request = extractRequestFromActionRecursive(actionRef.current);

    const response = await handlerRef.current(input, request, { signal: abortController.signal });

    const outputSchema = buildSchemaFromConstraintsRecursive(action, 'output');

    try {
      parse(outputSchema, response);
      parse(object({ actionStatus: optional(actionStatusTypeSchema) }), response);
    } catch (cause) {
      if (!abortController.signal.aborted) {
        setAction(action => ({ ...action, actionStatus: 'FailedActionStatus' }));
      }

      const error = new Error('Output is invalid.');

      error.cause = cause;

      throw error;
    }

    if (abortController.signal.aborted) {
      return;
    }

    setAction(action =>
      mergeResponseIntoActionRecursive({ ...action, actionStatus: 'CompletedActionStatus' }, response)
    );
  }, [abortController, actionRef, handlerRef, inputValidityRef, setAction]);

  const options = useMemo(
    () =>
      Object.freeze({
        input: extractVariablesFromActionRecursive(action, 'input'),
        inputValidity,
        submit
      }),
    [action, inputValidity, submit]
  );

  useEffect(() => () => abortController.abort(), [abortController]);

  return useMemo(() => Object.freeze([action, setAction, options] as const), [action, options, setAction]);
}

export { type ActionHandler };
