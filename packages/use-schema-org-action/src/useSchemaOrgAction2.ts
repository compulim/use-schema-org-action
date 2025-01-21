import { useCallback, useEffect, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { useRefFrom } from 'use-ref-from';
import { fallback, parse, safeParse } from 'valibot';
import { actionStatusTypeSchema } from './ActionStatusType.ts';
import { type ActionWithActionStatus } from './ActionWithActionStatus.ts';
import extractVariablesFromAction from './private/extractVariablesFromAction.ts';
import mergeVariablesIntoAction from './private/mergeVariablesIntoAction.ts';
import { type VariableMap } from './VariableMap.ts';

export default function useSchemaOrgAction<T extends object = object>(
  initialAction: T,
  handler: (input: VariableMap, init: Readonly<{ signal: AbortSignal }>) => Promise<VariableMap>
): readonly [
  ActionWithActionStatus<T>,
  Dispatch<SetStateAction<ActionWithActionStatus<T>>>,
  Readonly<{
    input: VariableMap;
    isInputValid: boolean;
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

  const isInputValid = useMemo<boolean>(() => mergeVariablesIntoAction(action, new Map(), 'input').isValid, [action]);

  const isInputValidRef = useRefFrom(isInputValid);

  const submit = useCallback<() => Promise<void>>(async () => {
    if (!isInputValidRef.current) {
      setAction(action => ({ ...action, actionStatus: 'FailedActionStatus' }));

      return Promise.reject(Error('Input is invalid, cannot submit.'));
    }

    setAction(action => ({ ...action, actionStatus: 'ActiveActionStatus' }));

    const input = extractVariablesFromAction(actionRef.current, 'input');

    const output = await handlerRef.current(input, { signal: abortController.signal });

    const outputValidationResult = mergeVariablesIntoAction(
      { ...action, actionStatus: 'CompletedActionStatus' as const },
      output,
      'output'
    );

    const isValid =
      outputValidationResult.isValid &&
      safeParse(actionStatusTypeSchema, outputValidationResult.value.actionStatus).success;

    if (!isValid) {
      return Promise.reject(new Error('Output is invalid.'));
    }

    if (abortController.signal.aborted) {
      return;
    }

    setAction(action => {
      const value = mergeVariablesIntoAction(
        { ...action, actionStatus: 'CompletedActionStatus' as const },
        output,
        'output'
      ).value;

      return value;
    });
  }, [abortController, actionRef, handlerRef, isInputValidRef, setAction]);

  const options = useMemo(
    () =>
      Object.freeze({
        input: extractVariablesFromAction(action, 'input'),
        isInputValid,
        submit
      }),
    [action, isInputValid, submit]
  );

  useEffect(() => () => abortController.abort(), [abortController]);

  return useMemo(() => Object.freeze([action, setAction, options] as const), [action, options, setAction]);
}
